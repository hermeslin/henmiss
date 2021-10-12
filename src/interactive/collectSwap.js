import inquirer from 'inquirer';
import bigInt from 'big-integer';
import moment from 'moment';
import chalk from 'chalk';
import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { fetchObjktSwaps } from '../hen/graphql.js';
import { mutez2Tez } from '../utils/tezos.js';
import { startIndicator, stopIndicator } from '../utils/time.js';
import { config } from '../config/index.js';

/**
 *
 * @returns
 */
const questionToken = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'tokenId',
      message: "What's Objkt do you want to buy?",
      validate(answer) {
        return answer.match(/^\d+$/) ? true : 'Please enter a number';
      },
    }
  ]);

  return answer;
}

/**
 *
 * @param {*} tokenId
 * @param {*} ui
 * @returns
 */
const questionPrice = async (tokenId, ui) => {
  const intervalId = startIndicator(ui, `Fetching swap data.`);

  try {
    const objktInfo = await fetchObjktSwaps(tokenId);
    const swaps = objktInfo.swaps
      // order by status, price
      .sort((a, b) => {
        const status = a.staus - b.status;
        const price = bigInt(a.price).subtract(b.price);
        return status || price;
      })
      .map((swap) => {
        const {
          id,
          price,
          creator: {
            address,
            name
          },
          timestamp,
          status
        } = swap;

        let list = {
          name: `${mutez2Tez(price)} TEZ, from ${(name !== '') ? name : address}, at ${timestamp}`,
          value: `${id}:${price}`,
          short: `${mutez2Tez(price)} TEZ`
        };

        if (status !== 0) {
          list = {
            ...list,
            disabled: (status === 1) ? 'finished swap' : 'canceled swap',
          }
        }

        return list;
      });

    // set the first option
    swaps.unshift({
      name: 'Choose another Objkt',
      value: 'start-over',
    })

    stopIndicator(ui, intervalId);
    return await inquirer.prompt([
      {
        type: 'list',
        name: 'swapData',
        message: `Which price whould you prefer?`,
        choices: swaps,
      },
    ]);
  } catch (error) {
    stopIndicator(ui, intervalId);
    ui.log.write(`${chalk.red('>>')} ${error.message}`);
    const answer =  await inquirer.prompt([
      {
        type: 'confirm',
        name: 'fetchSwapDataAgain',
        message: `Error happens, try to fetch again?`,
        default: true
      },
    ]);

    if (answer.fetchSwapDataAgain === true) {
      return await questionPrice(tokenId, ui);
    } else {
      return {
        swapData: 'start-over',
      };
    }
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
      message: "Enter your Private Key",
      mask: '*',
      validate(answer) {
        return answer.match(/^edsk\w+$/) ? true : 'Not the corrent format';
      },
    }
  ]);

  return answer;
}

/**
 *
 * @param {*} swapId
 * @param {*} price
 * @param {*} secretKey
 * @param {*} ui
 * @returns
 */
const collect = async (swapId, price, secretKey, ui) => {
  const now = moment(new Date()).utc();
  let indicatorIntervalId = null;

  try {
    // set in menmory signer
    indicatorIntervalId = startIndicator(ui, `Prepare the signer`, now);
    const Tezos = new TezosToolkit(config.tezos.rpcNode);

    const signer = await InMemorySigner.fromSecretKey(secretKey);
    Tezos.setProvider({ signer });

    stopIndicator(ui, indicatorIntervalId, false);

    // get smart contract info
    indicatorIntervalId = startIndicator(ui, `Initial the contract`, now);
    const contract = await Tezos.contract.at(config.hen.marketplaceAddress);
    if (!contract.methods.hasOwnProperty('collect')) {
      throw new TezosException(`${config.hen.marketplaceAddress} not has collect method.`);
    }
    stopIndicator(ui, indicatorIntervalId, false);

    // send the transaction
    indicatorIntervalId = startIndicator(ui, `Sending the transaction`, now);
    const operation = await contract.methods.collect(parseFloat(swapId)).send({
      amount: parseFloat(price),
      mutez: true,
      storageLimit: 350,
    });
    stopIndicator(ui, indicatorIntervalId, false);

    // number of confirmation to wait for
    indicatorIntervalId = startIndicator(ui, `Confirming the transaction`, now);
    await operation.confirmation(1);
    stopIndicator(ui, indicatorIntervalId);

    return {
      operationHash: operation.hash,
    };
  } catch (error) {
    stopIndicator(ui, indicatorIntervalId);
    ui.log.write(`${chalk.red('>>')} ${error.message}`);
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'sendTransactionAgain',
        message: `Error happens, try to send transaction again?`,
        default: true
      },
    ]);

    if (answer.sendTransactionAgain === true) {
      return await collect(swapId, price, secretKey, ui);
    } else {
      return {
        operationHash: 'start-over',
      };
    }
  }
}

/**
 *
 * @returns
 */
const interActive = async () => {
  // ask for the token id
  const { tokenId } = await questionToken();

  // after the first prompt, init the bottombar
  const ui = new inquirer.ui.BottomBar();

  // ask for the price
  const { swapData } = await questionPrice(tokenId, ui);
  if (swapData === 'start-over') {
    return await interActive();
  }

  // // ask for the secret key
  const { secretKey } = await questionSecretKey();

  // send the transaction
  const [swapId, price] = swapData.split(':');
  const { operationHash } = await collect(swapId, price, secretKey, ui);
  if (operationHash === 'start-over') {
    return await interActive();
  }

  return {
    tokenId,
    operationHash
  };
}

/**
 *
 */
interActive()
  .then((answers) => {
    const { tokenId, operationHash } = answers;
    console.log(`${chalk.green('>>')} Hooray! You collect the Objekt(${tokenId}) successfully`);
    console.log(`${chalk.green('>>')} Here is your tansaction information, https://tzkt.io/${operationHash}`);
  })
  .catch(error => console.log(chalk.red(error)));