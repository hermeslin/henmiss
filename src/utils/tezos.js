import bigInt from 'big-integer';
import { config } from '../config/index.js';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

/**
 *
 * @param {*} metez
 * @returns
 */
export const mutez2Tez = (metez) => {
  return bigInt(metez) / config.tezos.numberOfMutez;
};


/**
 *
 * @param {*} secretKey
 * @returns
 */
export const setSigner = async (secretKey) => {
  const rpcNode = config.tezos.rpcNode;
  const Tezos = new TezosToolkit(rpcNode);
  const signer = await InMemorySigner.fromSecretKey(secretKey);

  Tezos.setProvider({ signer });
  return Tezos;
}
