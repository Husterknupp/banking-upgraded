const { getDate, getMonthOfDate, day, fullYear } = require("./dateUtils");

module.exports.getWeeklyBudgetForComingWeeks = today => {
  const saturday = 6; // yes, Sunday is first day (idx 0)
  const monday = 1;
  let diffNextMonday;
  if (day(today) > monday) {
    diffNextMonday = saturday - day(today) + (monday + 1);
  } else {
    diffNextMonday = monday - day(today);
  }
  let nextMonday = new Date(
    fullYear(today),
    getMonthOfDate(today),
    getDate(today) + diffNextMonday
  );
  // keep for debugging
  //console.log({ base: today, day: day(today), nextMonday, diffNextMonday });

  let comingMondays = [];
  while (getMonthOfDate(nextMonday) === getMonthOfDate(today)) {
    comingMondays.push(nextMonday);
    nextMonday = new Date(
      fullYear(today),
      getMonthOfDate(today),
      getDate(nextMonday) + 7
    );
  }
  // keep for debugging
  //console.log({ comingMondays });

  // if the last month is on 28th+ we don't consider because almost the next month arrived ($$)
  let mondaysBefore28 = comingMondays.filter(date => date.getDate() <= 27);

  // only last three Mondays are interesting because safety "nach hinten raus"
  return mondaysBefore28
    .slice(Math.max(mondaysBefore28.length - 3, 0), mondaysBefore28.length)
    .map((date, idx) => [100.0, "Kohle für Alltag", date.getDate()]);
};
