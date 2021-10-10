import { getTezosKeyPair, validateMnemonic, validateTezosAddress } from '../../src/utils/keyPair';

describe('generate key pair from mnemonic', () => {
  it('gets the legace key pair', async () => {
    const isLegacy = true;
    const mnemonic = 'visa auction tourist fun task undo sudden pumpkin scrap beach left wet expand position pause soul sure correct apart wave reduce unaware confirm climb';
    const tezosKeyPair = getTezosKeyPair(mnemonic, isLegacy);

    const {
      secretKey,
      publicKey,
      publicKeyHash
    } = tezosKeyPair;

    expect('edskRuJV5Ux3sajgjDckF8JUn7m25aJgbc27n7DBVqtNz25qnrSNVcKd1UdkjS1hCmGviwH5Lj41V2s7aVsjsdxpz8FsqUVfgq').toStrictEqual(secretKey);
    expect('edpktxixXdhzuuhup8piqBHefppoYc1bScUk1M3XqyHTCrueUbYG36').toStrictEqual(publicKey);
    expect('tz1QV5zAxraALJkevWjo9QQn2AF7wRjmqnob').toStrictEqual(publicKeyHash);
    expect(await validateTezosAddress(secretKey, 'tz1QV5zAxraALJkevWjo9QQn2AF7wRjmqnob')).toStrictEqual(true);
  });

  it('gets the HD key pair', async () => {
    const isLegacy = false;
    const mnemonic = 'visa auction tourist fun task undo sudden pumpkin scrap beach left wet expand position pause soul sure correct apart wave reduce unaware confirm climb';
    const tezosKeyPair = getTezosKeyPair(mnemonic, isLegacy);
    const {
      secretKey,
      publicKey,
      publicKeyHash
    } = tezosKeyPair

    expect('edskS4oUooErx8Cjz8TrhWs4zpzhQHz3xzr4rprJruFMprFitqCihRQWRzftbLyBmubbtp4da9LZFjDEdnshiPKaym7JsV93RJ').toStrictEqual(secretKey);
    expect('edpkutPyXL9bCzVTJTW2tV1T26TCtcCyKa2CUAiZGNQyf6AS7mi4pD').toStrictEqual(publicKey);
    expect('tz1X7PPpwrgHSg1pXshwoFDLMjAHpwgjbwF4').toStrictEqual(publicKeyHash);
    expect(true).toStrictEqual(await validateTezosAddress(secretKey, 'tz1X7PPpwrgHSg1pXshwoFDLMjAHpwgjbwF4'));
  });

  it('validates the mnemonic', () => {
    const mnemonic = 'visa auction tourist fun task undo sudden pumpkin scrap beach left wet expand position pause soul sure correct apart wave reduce unaware confirm climb';

    expect(true).toStrictEqual(validateMnemonic(mnemonic));
    expect(false).toStrictEqual(validateMnemonic(`FAKE ${mnemonic}`));
  });
});