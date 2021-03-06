import { Command } from 'commander';
import * as packageJson from '../package.json';
import collectSwap from './interactive/collectSwap';
import getKeyPair from './interactive/getKeyPair';
import watchSwaps from './interactive/watchSwaps';

const program = new Command();
program.version(packageJson.version).description(packageJson.description);

program.command('collect')
  .description('The interactive interface to help you collect the objkt on the HEN')
  .action(() => {
    collectSwap()
      .then(() => {
        // do nothing
      })
      .catch((error) => console.log(error));
  });

program.command('key')
  .description('Help you to get the secret key from mnemonic step by step')
  .action(() => {
    getKeyPair()
      .then(() => {
        // do nothing
      })
      .catch((error) => console.log(error));
  });

program.command('watch')
  .description('Wathing all swap transactions')
  .action(() => {
    watchSwaps()
      .then(() => {
        // do nothing
      })
      .catch((error) => console.log(error));
  });

program.parse(process.argv);
