const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  axios = require("axios");
const { getDate, getMonthOfDate, day, fullYear } = require("./dateUtils");
const { getWeeklyBudgetForComingWeeks } = require("./payDayCalculator");

/*global __dirname:false*/
/*  ====================
    EXPRESS APP SETTINGS
    ====================
 */
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(express.static(__dirname + "/../client/banking-upgraded/build"));
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
  res.json(
    getWeeklyBudgetForComingWeeks(
      new Date(new Date().getFullYear(), month || new Date().getMonth(), day)
    )
  );
});

app.get("/whatElseIsComing", (req, res) => {
  const firstDayOfMonth = req.query.day || 1;
  const today = new Date();
  const currentMonth = getMonthOfDate(today) + 1;
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

    const weeklyBudget = getWeeklyBudgetForComingWeeks(
      new Date(fullYear(today), getMonthOfDate(today), day)
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
