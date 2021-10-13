import { Command } from 'commander';
import { interActive as collectSwap } from './interactive/collectSwap.js';
import { interActive as getKeyPair} from './interactive/getKeyPair.js';

const program = new Command();
program.version('1.0.0').description('HENMISS\n Your salvation when wallet always fail to connect');

program.command('collect')
  .description('The interactive interface to help you collect the objkt on the HEN')
  .action(() => {
    collectSwap()
      .then((result) => {
        // do nothing
      })
      .catch(error => console.log(error));
  });

program.command('key')
  .description('Help you to get the secret key from mnemonic step by step')
  .action(() => {
    getKeyPair()
      .then((result) => {
        // do nothing
      })
      .catch(error => console.log(error));
  });

program.parse(process.argv);
