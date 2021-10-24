import inquirer from 'inquirer';
import chalk from 'chalk';
import moment from 'moment';
import { parseSwapdata } from '../hen/format/operation';
import { buildConnection, subscribeToOperations } from '../hen/subscription';
import { startIndicator, stopIndicator } from '../utils/time';
import { mutez2Tez } from '../utils/tezos';
import { collect } from './collectSwap';

/**
 *
 * @param {*} message
 * @param {*} resolve
 * @param {*} reject
 * @param {*} payload
 */
const listSwapData = (message, resolve, reject, { ui, filter }) => {
  try {
    const { state, data } = message;
    ui.log.write(`${chalk.green('>>')} Latest block: ${state}`);

    // get swapped data
    if (data && data.length > 0) {
      const swappedData = parseSwapdata(data);
      swappedData.filter((swap) => {
        const {
          objktId,
          objktAmount,
          xtzPerObjkt,
        } = swap;

        let result = true;
        const { priceRange, editionsRange, tokenId } = filter;

        if (priceRange?.minimum) {
          result = result && (mutez2Tez(xtzPerObjkt) >= priceRange.minimum);
        }

        if (priceRange?.maximum) {
          result = result && (priceRange.maximum >= mutez2Tez(xtzPerObjkt));
        }

        if (editionsRange?.minimum) {
          result = result && (parseInt(objktAmount, 10) >= editionsRange.minimum);
        }

        if (editionsRange?.maximum) {
          result = result && (editionsRange.maximum >= parseInt(objktAmount, 10));
        }

        if (tokenId !== '0') {
          result = result && (objktId === tokenId);
        }

        return result;
      }).forEach((swap) => {
        const {
          objktId,
          objktAmount,
          xtzPerObjkt,
          timestamp,
        } = swap;

        ui.log.write(`  ${timestamp} ${objktId.padStart(6)} swap ${mutez2Tez(xtzPerObjkt).toString().padStart(5)} tez, ${objktAmount} ed.`);

        const { catchLatestSwap, tokenId } = filter;
        if (catchLatestSwap && tokenId === objktId) {
          resolve(swap);
        }
      });
    }
  } catch (error) {
    reject(error);
  }
};

/**
 *
 * @returns
 */
const questionPriceRange = async () => {
  const { minimum } = await inquirer.prompt([
    {
      type: 'input',
      name: 'minimum',
      message: `Lower bound price of swapped Objkt`,
      default: '0',
      validate(priceRange) {
        return priceRange.match(/^\d*\.?\d+$/) ? true : 'Not the corrct format';
      },
    },
  ]);

  const { maximum } = await inquirer.prompt([
    {
      type: 'input',
      name: 'maximum',
      message: `Upper bound price of swapped OBJKT`,
      default: '999999',
      validate(priceRange) {
        return priceRange.match(/^\d*\.?\d+$/) ? true : 'Not the corrct format';
      },
    },
  ]);

  return {
    priceRange: {
      minimum,
      maximum,
    },
  };
};

/**
 *
 * @returns
 */
const questionEditionsRange = async () => {
  const { minimum } = await inquirer.prompt([
    {
      type: 'input',
      name: 'minimum',
      message: `Minimum amount of OBJKT edtion`,
      default: '1',
      validate(editionsRange) {
        return editionsRange.match(/^(\d+)$/) ? true : 'Not the corrct format';
      },
    },
  ]);

  const { maximum } = await inquirer.prompt([
    {
      type: 'input',
      name: 'maximum',
      message: `Maximum amount of OBJKT edtion`,
      default: '999999',
      validate(editionsRange) {
        return editionsRange.match(/^(\d+)$/) ? true : 'Not the corrct format';
      },
    },
  ]);

  return {
    editionsRange: {
      minimum,
      maximum,
    },
  };
};

/**
 *
 * @returns
 */
const questionToken = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'tokenId',
      message: `Which Objkt do you want to watch?`,
      default: '0',
      validate(tokenId) {
        return tokenId.match(/^\d+$/) ? true : 'Please enter a number';
      },
    },
  ]);

  return answer;
};

/**
 *
 * @param {*} tokenId
 * @returns
 */
const questionSecretKey = async (tokenId) => {
  const answer = {
    secretKey: null,
  };

  if (tokenId === '0') {
    return answer;
  }

  const { autoCollect } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoCollect',
      message: `Do you want to auto clollect ${tokenId}?`,
      default: false,
    },
  ]);

  if (autoCollect === true) {
    const { secretKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'secretKey',
        message: `Enter your Secret Key`,
        mask: '*',
        validate(value) {
          return value.match(/^edsk\w+$/) ? true : 'Not the corrent format';
        },
      },
    ]);

    const { confirmAutoCollect } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmAutoCollect',
        message: `Do you realy want to ${chalk.red(`auto clollect ${tokenId}`)}?`,
        default: false,
      },
    ]);

    if (confirmAutoCollect === true) {
      answer.secretKey = secretKey;
    }
  }
  return answer;
};

const watchSwaps = async () => {
  const { priceRange } = await questionPriceRange();
  const { editionsRange } = await questionEditionsRange();
  const { tokenId } = await questionToken();
  const { secretKey } = await questionSecretKey(tokenId);

  const filter = {
    priceRange,
    editionsRange,
    tokenId,
    catchLatestSwap: (secretKey !== null),
  };

  // start watching
  const now = moment(new Date()).utc();
  const { ui, sratInterval } = startIndicator(`Watching swaps, ${chalk.green('Press Ctrl+C to exit')}`, now);
  let connection;

  try {
    connection = await buildConnection();
    await connection.start();

    // get target swap
    const swappedData = await subscribeToOperations(connection, listSwapData, { filter, ui });
    await connection.stop();
    stopIndicator({ ui, sratInterval });

    // collect swap
    const { swapId, xtzPerObjkt: price } = swappedData;
    console.log(`${chalk.green('>>')} Catpure ${tokenId} latest swap, ${mutez2Tez(price)} tez, start sending the transaction.`);
    const { operationHash } = await collect(swapId, price, secretKey);

    if (operationHash === 'start-over') {
      console.log(`${chalk.green('>>')} Stop watching.`);
    } else {
      console.log(`${chalk.green('>>')} Hooray! You collect the Objekt(${tokenId}) successfully`);
      console.log(`${chalk.green('>>')} Here is your tansaction information, https://tzkt.io/${operationHash}`);
    }

    return 'done';
  } catch (error) {
    await connection?.stop();
    stopIndicator({ ui, sratInterval });
    console.log(`${chalk.red('>>')} ${(undefined === error.message) ? error : error.message}`);
    return 'error';
  }
};

/**
 *
 */
export default watchSwaps;
