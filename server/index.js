const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  axios = require("axios");

/*global __dirname:false*/
/*  ====================
    EXPRESS APP SETTINGS
    ====================
 */
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(express.static(__dirname + "/../client"));
app.listen(app.get("port"), () => {
  // heroku transparency
  console.log(`Node app is running on port ${app.get("port")}`);
});

let monthly;
let yearly;
axios
  .get("")
  .then(({ data }) => {
    try {
      monthly = JSON.parse(
        data
          .split("START1")
          .pop()
          .split("END1")[0]
      );
      yearly = JSON.parse(
        data
          .split("START2")
          .pop()
          .split("END2")[0]
      );
    } catch (e) {
      console.error({ e });
    }
    console.log("done parsing");
  })
  .catch(e => console.log({ e }));

/*  =======
    ROUTES
    =======
 */
app.get("/mondaysStillComing", (req, res) => {
  const { day, month } = req.query;
  const dayToDayMoneyPerWeek = getWeeklyBudget(new Date(2019, month || 7, day));
  res.json(dayToDayMoneyPerWeek);
});

app.get("/whatElseIsComing", (req, res) => {
  const firstDayOfMonth = req.query.day || 1;
  const today = new Date();
  const currentMonth = month0Based(today) + 1;
  const daysOFCurrentMonth =
    req.query.day || new Date(fullYear(today), currentMonth, 0).getDate();

  const result = {
    forSure: {},
    optional: [],
    date: {
      dateDayOfTheMonth: getDate(today),
      dayOfTheWeek: day(today),
      currentMonth,
      daysOFCurrentMonth,
      year: fullYear(today)
    }
  };

  for (let day = firstDayOfMonth; day <= daysOFCurrentMonth; day++) {
    const yetToCome = ([amount, description, maybeDueDay, optional]) => {
      const dueDay = maybeDueDay || 1;
      return day <= dueDay && optional !== "optional";
    };

    const weeklyBudget = getWeeklyBudget(
      new Date(fullYear(today), month0Based(today), day)
    );
    const specificForThisMonth = yearly[currentMonth].filter(yetToCome);
    result.forSure[day] = [
      ...monthly.filter(yetToCome),
      ...specificForThisMonth,
      ...weeklyBudget
    ];
  }

  result.optional = monthly.filter(
    ([amount, description, maybeDueDay, optional]) => optional === "optional"
  );

  res.json(result);
});

function getWeeklyBudget(today) {
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
    month0Based(today),
    getDate(today) + diffNextMonday
  );
  // keep for debugging
  //console.log({ base: today, day: day(today), nextMonday, diffNextMonday });

  let comingMondays = [];
  while (month0Based(nextMonday) === month0Based(today)) {
    comingMondays.push(nextMonday);
    nextMonday = new Date(
      fullYear(today),
      month0Based(today),
      getDate(nextMonday) + 7
    );
  }
  // keep for debugging
  //console.log({ comingMondays });

  // we're interested only in the past three Mondays because safety "nach hinten raus"
  // also if the last month is on 28th+ we don't consider because almost the next month arrived ($$)
  return comingMondays
    .filter(date => date.getDate() <= 27)
    .slice(Math.max(comingMondays.length - 3, 0), comingMondays.length)
    .map((date, idx) => [100.0, "Kohle für Alltag", date.getDate()]);
}

function month0Based(date) {
  // return date.getUTCMonth()
  return date.getMonth();
}

function fullYear(date) {
  // date.getUTCFullYear()
  return date.getFullYear();
}

function getDate(date) {
  // return date.getUTCDate()
  return date.getDate();
}

function day(date) {
  // return date.getUTCDay()
  return date.getDay();
}
