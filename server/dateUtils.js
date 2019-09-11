/**
 * This is mainly because I was unsure whether or not I wanted to base everything on UTC or not.
 * Let's wait for the going-live on UTC based servers. Maybe I'll regret that decision then.
 */

/**
 * Months in js are 0-based. January = index 0
 *
 * @param date must be a valid js date.
 * @returns {number} month of the provided date.
 */
module.exports.getMonthOfDate = date => {
  // return date.getUTCMonth()
  return date.getMonth();
};

module.exports.fullYear = date => {
  // date.getUTCFullYear()
  return date.getFullYear();
};

module.exports.getDate = date => {
  // return date.getUTCDate()
  return date.getDate();
};

module.exports.day = date => {
  // return date.getUTCDay()
  return date.getDay();
};
