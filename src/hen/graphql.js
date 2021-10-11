import fetch from 'node-fetch';
import { config } from '../config/index.js';

/**
 * HEN graphql api server
 */
export const henGraphqlApiServer = config.hen.graphqlApiServer;

/**
 * Fetch objkt info
 *
 * @param {!number} objktId
 * @returns {Object} henObjktInfo
 */
export const fetchObjkt = async (objktId) => {
  const requestData = {
    operationName: 'objkt',
    variables: { id: objktId },
    query: `
      query
        objkt($id: bigint!) {
          hic_et_nunc_token_by_pk(id: $id) {
            id
            mime
            timestamp
            display_uri
            description
            artifact_uri
            metadata
            creator {
              address
              name
            }
            thumbnail_uri
            title
            supply
            royalties
            swaps {
              amount
              amount_left
              id
              price
              timestamp
              creator {
                address
                name
              }
              contract_version
              status
              royalties
              creator_id
              is_valid
            }
            token_holders(where: { quantity: { _gt: "0" } }) {
              holder_id
              quantity
              holder {
                name
              }
            }
          }
        }
    `,
  };

  const result = await fetch(henGraphqlApiServer, {
    method: 'post',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  });

  const json = await result.json();
  const { data: { hic_et_nunc_token_by_pk: henObjktInfo } } = json;

  return henObjktInfo;
};

/**
 *
 * @param {*} objktId
 * @returns {Object} henObjktInfo
 */
export const fetchObjktSwaps = async (objktId) => {
  const requestData = {
    operationName: 'objkt',
    variables: { id: objktId },
    query: `
      query
        objkt($id: bigint!) {
          hic_et_nunc_token_by_pk(id: $id) {
            id
            timestamp
            description
            metadata
            creator {
              address
              name
            }
            title
            supply
            swaps {
              amount
              amount_left
              id
              price
              timestamp
              creator {
                address
                name
              }
              status
              creator_id
              is_valid
            }
          }
        }
    `,
  };

  const result = await fetch(henGraphqlApiServer, {
    method: 'post',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  });

  const json = await result.json();
  const { data: { hic_et_nunc_token_by_pk: henObjktInfo } } = json;

  return henObjktInfo;
};