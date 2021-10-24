import dotenv from 'dotenv';

/**
 *
 */
dotenv.config();

/**
 * config
 *
 */
export default {
  tezos: {
    rpcNode: process.env.TEZOS_RPC_NODE,
    numberOfMutez: process.env.TEZOS_NUMBER_OF_MUTEZ,
    tzktEventUrl: process.env.TEZOS_TZKT_EVENT_URL,
  },
  hen: {
    graphqlApiServer: process.env.HEN_GRAPHQL_API_SERVER,
    marketplaceAddress: process.env.HEN_MARKETPLACE_ADDRESS,
  },
};
