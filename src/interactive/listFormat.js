
import { mutez2Tez } from "../utils/tezos.js";

/**
 * Foramt collectable swap data
 *
 * @param {array} swaps
 * @returns {array}
 */
export const collectableSwaps = (swaps) => {
  // order by status, price
  return swaps
    .sort((a, b) => {
      const status = a.staus - b.status;
      const price = bigInt(a.price).subtract(b.price);
      return status || price;
    })
    .map((swap) => {
      const {
        id,
        price,
        creator: {
          address,
          name
        },
        timestamp,
        status
      } = swap;

      let list = {
        name: `${mutez2Tez(price)} TEZ, from ${(name !== '') ? name : address}, at ${timestamp}`,
        value: `${id}:${price}`,
        short: `${mutez2Tez(price)} TEZ`
      };

      if (status !== 0) {
        list = {
          ...list,
          disabled: (status === 1) ? 'finished swap' : 'canceled swap',
        }
      }

      return list;
    });
}