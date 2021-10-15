import inquirer from 'inquirer';
import moment from 'moment';
import chalk from 'chalk';
import { setSigner } from '../utils/tezos';
import {
  initCollectContract,
  sendCollectTransaction,
  confirmTransaction,
} from '../hen/smartContract';
import { fetchObjktSwaps } from '../hen/graphql';
import collectableSwaps from './format/listFormat';
import { startIndicator, stopIndicator } from '../utils/time';

/**
 *
 * @returns
 */
const questionToken = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'tokenId',
      message: `What's Objkt do you want to buy?`,
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
 * @param {*} ui
 * @returns
 */
const questionPrice = async (tokenId) => {
  const intervalId = startIndicator(`Fetching swap data.`);

  try {
    const objktInfo = await fetchObjktSwaps(tokenId);
    const swaps = collectableSwaps(objktInfo.swaps);

    if (swaps.length <= 0) {
      swaps.push({
        name: `Not for sale`,
        value: null,
        disabled: `empty swaps`,
      });
    }

    // set the first option
    swaps.unshift({
      name: 'Choose another Objkt',
      value: 'start-over',
    });
    stopIndicator(intervalId);

    return await inquirer.prompt([
      {
        type: 'list',
        name: 'swapData',
        message: `Which price whould you prefer?`,
        choices: swaps,
      },
    ]);
  } catch (error) {
    stopIndicator(intervalId);

    const ui = new inquirer.ui.BottomBar();
    ui.log.write(`${chalk.red('>>')} ${(undefined === error.message) ? error : error.message}`);
    ui.close();

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'fetchSwapDataAgain',
        message: `Error happens, try to fetch again?`,
        default: true,
      },
    ]);

    if (answer.fetchSwapDataAgain === true) {
      const price = await questionPrice(tokenId, ui);
      return price;
    }

    return {
      swapData: 'start-over',
    };
  }
};

/**
 *
 */
const questionSecretKey = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'password',
      name: 'secretKey',
      message: `Enter your Secret Key`,
      mask: '*',
      validate(secretKey) {
        return secretKey.match(/^edsk\w+$/) ? true : 'Not the corrent format';
      },
    },
  ]);

  return answer;
};

/**
 *
 * @param {*} swapId
 * @param {*} price
 * @param {*} secretKey
 * @param {*} ui
 * @returns
 */
const collect = async (swapId, price, secretKey) => {
  const now = moment(new Date()).utc();
  let indicatorIntervalId = null;
  indicatorIntervalId = startIndicator(`Prepare the signer`, now);

  try {
    // set in menmory signer
    const Tezos = await setSigner(secretKey);
    stopIndicator(indicatorIntervalId, false);

    // get smart contract info
    indicatorIntervalId = startIndicator(`Initial the contract`, now);
    const contract = await initCollectContract(Tezos);
    stopIndicator(indicatorIntervalId, false);

    // send the transaction
    indicatorIntervalId = startIndicator(`Sending the transaction`, now);
    const operation = await sendCollectTransaction(contract, swapId, price);
    stopIndicator(indicatorIntervalId, false);

    // number of confirmation to wait for
    indicatorIntervalId = startIndicator(`Confirming the transaction`, now);
    const operationHash = await confirmTransaction(operation);
    stopIndicator(indicatorIntervalId);

    return {
      operationHash,
    };
  } catch (error) {
    stopIndicator(indicatorIntervalId);

    const ui = new inquirer.ui.BottomBar();
    ui.log.write(`${chalk.red('>>')} ${(undefined === error.message) ? error : error.message}`);
    ui.close();

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'sendTransactionAgain',
        message: `Error happens, try to send transaction again?`,
        default: true,
      },
    ]);

    if (answer.sendTransactionAgain === true) {
      const sednAgain = await collect(swapId, price, secretKey);
      return sednAgain;
    }

    return {
      operationHash: 'start-over',
    };
  }
};

/**
 *
 * @returns
 */
const collectSwap = async () => {
  // ask for the token id
  const { tokenId } = await questionToken();

  // ask for the price
  const { swapData } = await questionPrice(tokenId);
  if (swapData === 'start-over') {
    const questionPriceStartOver = await collectSwap();
    return questionPriceStartOver;
  }

  // ask for the secret key
  const { secretKey } = await questionSecretKey();

  // send the transaction
  const [swapId, price] = swapData.split(':');
  const { operationHash } = await collect(swapId, price, secretKey);
  if (operationHash === 'start-over') {
    const collectStartOver = await collectSwap();
    return collectStartOver;
  }

  return {
    tokenId,
    operationHash,
  };
};

/**
 *
 */
export default async () => {
  const result = await collectSwap();
  const { tokenId, operationHash } = result;

  console.log(`${chalk.green('>>')} Hooray! You collect the Objekt(${tokenId}) successfully`);
  console.log(`${chalk.green('>>')} Here is your tansaction information, https://tzkt.io/${operationHash}`);

  return 'done';
};
