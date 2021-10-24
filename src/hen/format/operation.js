import { mutez2Tez } from '../../utils/tezos';
import config from '../../config';

/**
 *
 * @param {*} operations
 * @returns
 */
export const parseSwapdata = (operations) => (
  operations.filter((operation) => {
    const {
      parameter, status, diffs, target,
    } = operation;

    if (!parameter || !parameter.entrypoint || !diffs || !target) {
      return false;
    }

    return target.address === config.hen.marketplaceAddress
      && parameter.entrypoint === 'swap'
      && status === 'applied'
      && diffs[0]?.path === 'swaps'
      && diffs[0]?.action === 'add_key';
  }).map((operation) => {
    const {
      parameter: {
        entrypoint,
        value: { objkt_id: objktId },
      },
      status, diffs, timestamp,
    } = operation;
    const {
      content: {
        key,
        value: {
          objkt_amount: objktAmount,
          xtz_per_objkt: xtzPerObjkt,
        },
      },
    } = diffs[0];

    return {
      entrypoint,
      objktId,
      status,
      swapId: key,
      objktAmount,
      xtzPerObjkt,
      timestamp,
    };
  })
);

export default parseSwapdata;
