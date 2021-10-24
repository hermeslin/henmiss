import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import config from '../config/index';

/**
 *
 */
export const { tzktEventUrl } = config.tezos;

/**
 *
 * @returns
 */
export const buildConnection = () => {
  const connection = new HubConnectionBuilder()
    .configureLogging(LogLevel.None)
    .withUrl(tzktEventUrl)
    .build();
  return connection;
};

/**
 *
 * @param {*} connection
 * @param {*} callback
 * @param {*} payload
 * @returns
 */
export const subscribeToOperations = (connection, callback, payload) => (
  new Promise((resolve, reject) => {
    process.on('SIGINT', () => {
      reject(new Error('Exit the program.'));
    });

    connection.on('operations', (message) => {
      callback(message, resolve, reject, payload);
    });

    connection.invoke('SubscribeToOperations', { types: 'transaction' }).catch((error) => {
      reject(error);
    });
  })
);
