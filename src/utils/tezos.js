import bigInt from 'big-integer';
import { config } from '../config';

/**
 *
 * @param {*} metez
 * @returns
 */
export const mutez2Tez = (metez) => {
  return bigInt(metez) / config.tezos.numberOfMutez;
};
