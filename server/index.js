const express = require("express")
  , app = express()
  , bodyParser = require("body-parser")
  , axios = require('axios');

/*global __dirname:false*/
/*  ====================
    EXPRESS APP SETTINGS
    ====================
 */
app.set("port", (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../client'));
app.listen(app.get("port"), () => { // heroku transparency
    console.log(`Node app is running on port ${app.get("port")}`);
});


let monthly;
let yearly;
axios.get("").then(({data}) => {
    try {
        monthly = JSON.parse(data.split("START1").pop().split("END1")[0]);
        yearly = JSON.parse(data.split("START2").pop().split("END2")[0]);
    } catch (e) {
        console.error({e});
    }
    console.log('done parsing');
}).catch(e => console.log({e}));


/*  =======
    ROUTES
    =======
 */
app.get('/mondaysStillComing', (req, res) => {
    const {day, month} = req.query;
    const dayToDayMoneyPerWeek = everyMonday100Bugs(new Date(2019, month || 7, day));
    res.json(dayToDayMoneyPerWeek);
});

app.get('/whatElseIsComing', (req, res) => {
    const today = new Date();
    let currentMonth = month0Based(today) + 1;
    const daysOFCurrentMonth = new Date(fullYear(today), currentMonth, 0).getDate();

    //todo 100 EUR/Woche (s. u.)
    let result = {
        forSure: {},
        optional: [],
        date: {
            dateDayOfTheMonth: getDate(today),
            dayOfTheWeek: day(today),
            currentMonth,
            daysOFCurrentMonth,
            year: month0Based(today),
        },
    };
    for (let day = 1; day <= daysOFCurrentMonth; day++) {
        const yetToCome = ([amount, description, maybeDueDay, optional]) => {
            const dueDay = maybeDueDay || 1;
            return day <= dueDay && optional !== 'optional';
        };
        const dayToDayMoneyPerWeek = everyMonday100Bugs(new Date(month0Based(today), month0Based(today), day));
        const specificForThisMonth = yearly[currentMonth].filter(yetToCome);
        result.forSure[day] = [...(monthly.filter(yetToCome)), ...specificForThisMonth, ...dayToDayMoneyPerWeek];
    }
    result.optional = monthly
      .filter(([amount, description, maybeDueDay, optional]) => optional === 'optional');
    res.json(result);
});

function everyMonday100Bugs(today, daysOfCurrentMonth) {
    console.log(`${today} is base`);
    const saturday = 6; // yes, Sunday is first day (idx 0)
    const monday = 1;
    let diffNextMonday;
    if (day(today) > monday) {
        diffNextMonday = saturday - day(today) + (monday + 1);
    } else {
        diffNextMonday = monday - day(today);
    }
    let nextMonday = new Date(fullYear(today), month0Based(today), getDate(today) + diffNextMonday);
    console.log({base: today, day: day(today), nextMonday, diffNextMonday });

    let comingMondays = [];
    while (month0Based(nextMonday) === month0Based(today)) {
        comingMondays.push(nextMonday);
        nextMonday = new Date(month0Based(today), month0Based(today), getDate(nextMonday) + 7);
    }
    console.log({comingMondays});
    // last 3 only

    /*
    * const {dayOfMonth, dayOfWeek} = today();
    * wie viele Montage kommen noch?
    * diff zu nxt Montag (wie viele Tage noch?)
    * nextMonday = heute + diff
    * while (nextMonday.month === today.month) {
    *   // last 3 only
    *   comingMondays.push(nextMonday)
    *   nextMonday = nextMonday + 7 days
    * }
    *
     */
    // [].slice(arr.length - 3, arr.length).map((date, idx) => [100.00, Kohle für Alltag', date.day]]
    let _0meansSunday_1meansMonday_6meansSaturday = day(new Date());
    let dayOfTheMonth_1based = getDate(new Date());
    return [[100.00, "1. Mal Kohle"]]
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
