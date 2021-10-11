import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { config } from '../config/index.js';

/**
 *
 * @param {*} message
 */
function TezosException(message) {
  this.message = message;
  this.name = 'TezosException';
}

/**
 * collect the swap
 *
 * @param {*} swapId
 */
export const collect = async (swapId, price, secretKey) => {
  const Tezos = new TezosToolkit(config.tezos.rpcNode);
  const signer = await InMemorySigner.fromSecretKey(secretKey);

  // set im menmory signer
  Tezos.setProvider({ signer });

  // get smart contract info
  const contract = await Tezos.contract.at(config.hen.marketplaceAddress);
  if (!contract.methods.hasOwnProperty('collect')) {
    throw new TezosException(`${config.hen.marketplaceAddress} not has collect method.`);
  }

  const operation = await contract.methods.collect(parseFloat(swapId)).send({
    amount: parseFloat(price),
    mutez: true,
    storageLimit: 350,
  });

  // number of confirmation to wait for
  await operation.confirmation(2);

  return operation.hash;
}
