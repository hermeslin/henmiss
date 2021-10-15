import { setSigner } from '../utils/tezos';
import config from '../config/index';

/**
 *
 * @param {*} message
 */
function HenException(message) {
  this.message = message;
  this.name = 'TezosException';
}

/**
 *
 * @returns
 */
export const initCollectContract = async (tezos) => {
  const contractAddress = config.hen.marketplaceAddress;
  const contract = await tezos.contract.at(contractAddress);

  if (!Object.prototype.hasOwnProperty.call(contract.methods, 'collect')) {
    throw new HenException(`${contractAddress} not has collect method.`);
  }

  return contract;
};

/**
 *
 * @param {*} contract
 * @param {*} swapId
 * @param {*} price
 * @returns
 */
export const sendCollectTransaction = async (contract, swapId, price) => {
  const contractAddress = config.hen.marketplaceAddress;

  if (!Object.prototype.hasOwnProperty.call(contract.methods, 'collect')) {
    throw new HenException(`${contractAddress} not has collect method.`);
  }

  const operation = await contract.methods.collect(parseFloat(swapId)).send({
    amount: parseFloat(price),
    mutez: true,
    storageLimit: 350,
  });

  return operation;
};

/**
 * number of confirmation to wait for
 *
 * @param {*} operation
 * @param {*} confirmation
 * @returns
 */
export const confirmTransaction = async (operation, confirmation = 1) => {
  await operation.confirmation(confirmation);
  return operation.hash;
};

/**
 * collect the swap
 *
 * @param {*} swapId
 * @param {*} price
 * @param {*} secretKey
 * @returns {string} operation hash
 */
export const collect = async (swapId, price, secretKey) => {
  //
  const tezos = await setSigner(secretKey);
  const contract = await initCollectContract(tezos);
  const operation = await sendCollectTransaction(contract, swapId, price);
  const operationHash = await confirmTransaction(operation);

  return operationHash;
};
