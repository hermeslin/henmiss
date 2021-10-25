import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import chalk from 'chalk';
import config from '../config/index';
import { nowDateTime } from '../utils/time';

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
    .withAutomaticReconnect()
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

    connection.onreconnecting((error) => {
      const { ui } = payload;
      ui.log.write(`${chalk.yellow('>>')} ${nowDateTime()} Reconnecting to server. Error: "${error}". `);
    });

    connection.onreconnected(() => {
      const { ui } = payload;
      ui.log.write(`${chalk.yellow('>>')} ${nowDateTime()} Connected to server.`);
      connection.invoke('SubscribeToOperations', { types: 'transaction' }).catch((error) => {
        reject(error);
      });
    });

    connection.onclose(() => {
      reject(new Error(`Connection closed.`));
    });

    connection.on('operations', (message) => {
      callback(message, resolve, reject, payload);
    });

    connection.invoke('SubscribeToOperations', { types: 'transaction' }).catch((error) => {
      reject(error);
    });
  })
);
