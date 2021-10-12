import bigInt from 'big-integer';
import { config } from '../config/index.js';

/**
 *
 * @param {*} metez
 * @returns
 */
export const mutez2Tez = (metez) => {
  return bigInt(metez) / config.tezos.numberOfMutez;
};
