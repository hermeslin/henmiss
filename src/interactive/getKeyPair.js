import chalk from "chalk";
import inquirer from "inquirer";
import { validateMnemonic, getTezosKeyPair } from '../utils/keyPair.js';
import { startIndicator, stopIndicator } from "../utils/time.js";

const questionMnemonic = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'password',
      name: 'mnemonic',
      message: "What's your mnemonic?",
      validate(answer) {
        return validateMnemonic(answer) ? true : 'Not the correct mnemonic';
      },
    }
  ]);

  return answer;
}

const questionWalletType = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletType',
      message: "What's your wallet type?",
      choices: [
        {
          name: 'HD Wallet',
          value: 'hd'
        },
        {
          name: 'Legacy Wallet',
          value: 'legacy'
        },
      ]
    }
  ]);

  return answer;
}

const questionDerivationPath = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'derivationPath',
      message: "Want to customize your derivation path?",
      default: `m/44'/1729'/0'/0'`
    }
  ]);

  return answer;
}

const questionPublicKeyHash = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'publicKeyHash',
      message: "Enter your Tezos wallet address",
    }
  ]);

  return answer;
}

const interActive = async () => {

  const { mnemonic } = await questionMnemonic();
  const { walletType } = await questionWalletType();

  let derivationPath = '';
  if (walletType === 'hd') {
    const { derivationPath: answer } = await questionDerivationPath();
    derivationPath = answer;
  }

  const { publicKeyHash } = await questionPublicKeyHash();

  const interval = startIndicator('Start calcualte your key pair');
  const isLegacy = (walletType === 'hd') ? false : true;
  const tezonsKeyPair = getTezosKeyPair(mnemonic, isLegacy, derivationPath);
  stopIndicator(interval);

  return {
    ...tezonsKeyPair,
    userInputKeyHash: publicKeyHash
  }
}

/**
 *
 */
interActive()
  .then((answers) => {
    const { secretKey, publicKeyHash, userInputKeyHash } = answers;
    if (publicKeyHash !== userInputKeyHash) {
      console.log(`${chalk.red('>>')} Your mnemoinc seems not to match your Tezos wallet address, try it again.`);
    } else {
      console.log(`${chalk.green('>>')} Here is your secret key, ${chalk.inverse(`PLEASE TAKE GOOD CARE OF IT!`)}`);
      console.log(`${chalk.green('>>')} ${secretKey}`);
    }
  })
  .catch(error => console.log(error));
