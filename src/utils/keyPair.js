import * as bip39 from 'bip39';
import b2u8 from 'buffer-to-uint8array';
import { blake2b } from 'blakejs';
import { sign as naclSign } from 'tweetnacl';
import { prefix, Prefix, b58cencode } from '@taquito/utils';
import HDKey from '@starcoin/stc-hdkey';

/**
 * convert mnemonic to key pair
 *
 * @param {string} mnemonic your wallet mnemonic
 */
export const getLegacyKeyPair = (mnemonic) => {
  // NOTE: ed25519 spec only support 32 Byte
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  return naclSign.keyPair.fromSeed(b2u8(seedBuffer));
}

/**
 * convert mnemonic to HD key pair
 *
 * @param {string} mnemonic
 * @param {string} derivationPath
 * @returns
 */
export const getHdKeyPair = (mnemonic, derivationPath) => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);

  // @starcoin/stc-hdkey use 'ed25519 seed' as Master key.
  // That's why I choose this package to generate hd key
  const hdKey = HDKey.fromMasterSeed(seedBuffer);
  const childNode = hdKey.derive(derivationPath);

  return naclSign.keyPair.fromSeed(b2u8(childNode.privateKey));
}

/**
 * convert mnemonic to key pair
 *
 * @param {string} mnemonic
 * @param {boolean} isLegacy
 * @param {string} derivationPath
 * @returns
 */
export const getKeyPair = (mnemonic, isLegacy = false, derivationPath) => {
  return (isLegacy) ? getLegacyKeyPair(mnemonic) : getHdKeyPair(mnemonic, derivationPath);
}

/**
 * convert mnemonic to tezos foramt key pair
 * NOTE: default derivation path is m/44'/1729'/0'/0', the last string of this default path is an apostrophe.
 * It's weird, but Kukai and Airgap use this pattern by default.
 *
 * @param {string} mnemonic
 * @param {boolean} isLegacy
 * @param {string} derivationPath
 * @returns
 */
export const getTezosKeyPair = (mnemonic, isLegacy = false, derivationPath = `m/44'/1729'/0'/0'`) => {
  const keyPair = getKeyPair(mnemonic, isLegacy, derivationPath);

  return {
    secretKey: b58cencode(keyPair.secretKey, prefix[Prefix.EDSK]),
    publicKey: b58cencode(keyPair.publicKey, prefix[Prefix.EDPK]),
    publicKeyHash: b58cencode(blake2b(keyPair.publicKey, null, 20), prefix[Prefix.TZ1]),
  }
}
