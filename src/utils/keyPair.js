import * as bip39 from 'bip39';
import b2u8 from 'buffer-to-uint8array';
import { blake2b } from 'blakejs';
import tweetnacl from 'tweetnacl';
import { prefix, Prefix, b58cencode } from '@taquito/utils';
import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import HDKey from '@starcoin/stc-hdkey';

/**
 * validate mnemoinc
 *
 * @param {string} mnemonic your wallet mnemonic
 * @returns {boolean}
 */
export const validateMnemonic = (mnemonic) => bip39.validateMnemonic(mnemonic);

/**
 * convert mnemonic to key pair
 *
 * @param {string} mnemonic your wallet mnemonic
 * @returns {object} key pair that contains secret key, public key
 */
export const getLegacyKeyPair = (mnemonic) => {
  // NOTE: ed25519 spec only support 32 Byte
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  return tweetnacl.sign.keyPair.fromSeed(b2u8(seedBuffer));
};

/**
 * convert mnemonic to HD key pair
 * NOTE: @starcoin/stc-hdkey use 'ed25519 seed' as Master key.
 * That's why I choose this package to generate hd key
 *
 * @param {string} mnemonic
 * @param {string} derivationPath
 * @returns {object}
 */
export const getHdKeyPair = (mnemonic, derivationPath) => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seedBuffer);
  const childNode = hdKey.derive(derivationPath);

  return tweetnacl.sign.keyPair.fromSeed(b2u8(childNode.privateKey));
};

/**
 * convert mnemonic to key pair
 *
 * @param {string} mnemonic
 * @param {boolean} isLegacy
 * @param {string} derivationPath derivation path
 * @returns {object}
 */
export const getKeyPair = (mnemonic, isLegacy = false, derivationPath) => (
  (isLegacy)
    ? getLegacyKeyPair(mnemonic)
    : getHdKeyPair(mnemonic, derivationPath)
);

/**
 * convert mnemonic to tezos foramt key pair
 * NOTE: default derivation path is m/44'/1729'/0'/0',
 * the last string of this default path is an apostrophe.
 * It's weird, but Kukai and Airgap use this pattern by default.
 *
 * @param {string} mnemonic
 * @param {boolean} isLegacy
 * @param {string} derivationPath
 * @returns {object}
 */
export const getTezosKeyPair = (mnemonic, isLegacy = false, derivationPath = `m/44'/1729'/0'/0'`) => {
  const keyPair = getKeyPair(mnemonic, isLegacy, derivationPath);

  return {
    secretKey: b58cencode(keyPair.secretKey, prefix[Prefix.EDSK]),
    publicKey: b58cencode(keyPair.publicKey, prefix[Prefix.EDPK]),
    publicKeyHash: b58cencode(blake2b(keyPair.publicKey, null, 20), prefix[Prefix.TZ1]),
  };
};

/**
 * validate tezoss address
 *
 * @param {*} secretKey secret Key
 * @param {*} tezosAddress tezos address
 * @returns {boolean}
 */
export const validateTezosAddress = async (secretKey, tezosAddress) => {
  const signer = await InMemorySigner.fromSecretKey(secretKey);

  const Tezos = new TezosToolkit();
  Tezos.setProvider({ signer });

  return await Tezos.signer.publicKeyHash() === tezosAddress;
};
