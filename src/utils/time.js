import moment from 'moment';
import inquirer from 'inquirer';

/**
 *
 * @param {*} ui
 * @param {*} message
 * @param {*} now
 * @returns
 */
export const startIndicator = (message, nowMoment = null) => {
  const ui = new inquirer.ui.BottomBar();

  let now = nowMoment;
  if (now === null) {
    now = moment(new Date()).utc();
  }

  let i = 0;
  const loader = [`/ ${message}`, `| ${message}`, `\\ ${message}`, `- ${message}`];

  const sratInterval = setInterval(() => {
    const indicator = loader[i % 4];
    i = (i % 4 === 3) ? 0 : i + 1;
    ui.updateBottomBar(`${indicator}, ${now.fromNow(true)} has passed.`);
  }, 200);

  return {
    ui,
    sratInterval,
  };
};

/**
 *
 * @param {*} ui
 * @param {*} intervalId
 * @param {*} clear
 */
export const stopIndicator = (interval, clear = true) => {
  const { ui, sratInterval } = interval;

  clearInterval(sratInterval);
  if (clear) {
    ui.updateBottomBar('');
  }
  ui.close();
};

/**
 *
 * @param {*} ms
 * @returns
 */
export const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 *
 * @param {*} ms
 * @param {*} message
 * @returns
 */
export const waitThenThrow = async (ms, message) => (
  new Promise(() => {
    setTimeout(() => {
      throw message;
    }, ms);
  })
);
