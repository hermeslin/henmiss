import moment from 'moment';

/**
 *
 * @param {*} ui
 * @param {*} message
 * @param {*} now
 * @returns
 */
export const startIndicator = (ui, message, now = null) => {
  if (now === null) {
    now = moment(new Date()).utc();
  }

  let i = 0;
  const loader = [`/ ${message}`, `| ${message}`, `\\ ${message}`, `- ${message}`]

  const intervalId = setInterval(() => {
    const indicator = loader[i % 4];
    i = (i % 4 === 3) ? 0 : i + 1;
    ui.updateBottomBar(`${indicator}, ${now.fromNow(true)} has passed.`);
  }, 200);

  return intervalId;
}

/**
 *
 * @param {*} ui
 * @param {*} intervalId
 * @param {*} clear
 */
export const stopIndicator = (ui, intervalId, clear = true) => {
  clearInterval(intervalId);
  if (clear) {
    ui.updateBottomBar('');
  }
}