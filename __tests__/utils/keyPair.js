import { getTezosKeyPair } from '../../src/utils/keyPair';

describe('generate key pair from mnemonic', () => {
  it('gets the legace key pair', () => {
    const isLegacy = true;
    const mnemonic = 'visa auction tourist fun task undo sudden pumpkin scrap beach left wet expand position pause soul sure correct apart wave reduce unaware confirm climb';
    const {
      secretKey,
      publicKey,
      publicKeyHash
    } = getTezosKeyPair(mnemonic, isLegacy);

    expect(secretKey).toStrictEqual('edskRuJV5Ux3sajgjDckF8JUn7m25aJgbc27n7DBVqtNz25qnrSNVcKd1UdkjS1hCmGviwH5Lj41V2s7aVsjsdxpz8FsqUVfgq');
    expect(publicKey).toStrictEqual('edpktxixXdhzuuhup8piqBHefppoYc1bScUk1M3XqyHTCrueUbYG36');
    expect(publicKeyHash).toStrictEqual('tz1QV5zAxraALJkevWjo9QQn2AF7wRjmqnob');
  });

  it('gets the HD key pair', () => {
    const isLegacy = false;
    const mnemonic = 'visa auction tourist fun task undo sudden pumpkin scrap beach left wet expand position pause soul sure correct apart wave reduce unaware confirm climb';
    const {
      secretKey,
      publicKey,
      publicKeyHash
    } = getTezosKeyPair(mnemonic, isLegacy);

    expect(secretKey).toStrictEqual('edskS4oUooErx8Cjz8TrhWs4zpzhQHz3xzr4rprJruFMprFitqCihRQWRzftbLyBmubbtp4da9LZFjDEdnshiPKaym7JsV93RJ');
    expect(publicKey).toStrictEqual('edpkutPyXL9bCzVTJTW2tV1T26TCtcCyKa2CUAiZGNQyf6AS7mi4pD');
    expect(publicKeyHash).toStrictEqual('tz1X7PPpwrgHSg1pXshwoFDLMjAHpwgjbwF4');
  });
});