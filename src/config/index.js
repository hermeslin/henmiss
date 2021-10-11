import dotenv from 'dotenv';

/**
 *
 */
dotenv.config();

/**
 * config
 *
 */
export const config = {
  tezos: {
    rpcNode: process.env.TEZOS_RPC_NODE,
    numberOfMutez: process.env.TEZOS_NUMBER_OF_MUTEZ,
  },
  hen: {
    graphqlApiServer: process.env.HEN_GRAPHQL_API_SERVER,
    marketplaceAddress: process.env.HEN_MARKETPLACE_ADDRESS,
  }
};
