import bigInt from 'big-integer';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import config from '../config/index';

/**
 *
 * @param {*} metez
 * @returns
 */
export const mutez2Tez = (metez) => bigInt(metez) / config.tezos.numberOfMutez;

/**
 *
 * @param {*} secretKey
 * @returns
 */
export const setSigner = async (secretKey) => {
  const { rpcNode } = config.tezos;
  const Tezos = new TezosToolkit(rpcNode);
  const signer = await InMemorySigner.fromSecretKey(secretKey);

  Tezos.setProvider({ signer });
  return Tezos;
};
