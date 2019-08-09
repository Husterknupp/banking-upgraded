var express = require("express")
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
app.get('/whatElseIsComing', (req, res) => {
    const today = new Date();
    let currentMonth = today.getUTCMonth() + 1;
    const daysOFCurrentMonth = new Date(today.getUTCFullYear(), currentMonth, 0).getDate();

    //todo 100 EUR/Woche (s. u.)
    let result = {
        forSure: {},
        optional: []
    };
    for (let day = 1; day <= daysOFCurrentMonth; day++) {
        const yetToCome = ([amount, description, maybeDueDay, optional]) => {
            const dueDay = maybeDueDay || 1;
            return day <= dueDay && optional !== 'optional';
        };
        const reservedPerWeek = everyMonday100Bugs();
        const specificForThisMonth = yearly[currentMonth].filter(yetToCome);
        result.forSure[day] = [...(monthly.filter(yetToCome)), ...specificForThisMonth];
    }
    result.optional = monthly
      .filter(([amount, description, maybeDueDay, optional]) => optional === 'optional');
    res.json(result);

    /* INPUT
        monthly = [
          [505.00,"Miete"],
          [2.50, "Spotify Benny"],
            ...
          [50.00,"Physio Benny","","optional"]
        ]

        yearly =
        {"1":
            [[72.00,"Garten Wasserrechnung"],
            [197.21,"HUK/Bruderhilfe KFZ Vers."]],
        "2": [[52.50,"GEZ",15]],
            ...
        "12": []}
     */

    /* BE
        (1) UI sums up
        {forSure: {
            "1": [[52.00,"GEZ",15],[100.00,"Betrag für die Woche",am 1.Montag]],
            "2": [[52.00,"GEZ",15],[100.00,"Betrag für die Woche",am 1.Montag]],
            // ...
            "16": explanations: [[100.00,"Betrag für die Woche",am 3.Montag]],
        }, optional: [[50.00,"Physio Benny"]] }

        (2) aggregated in BE
        {forSure: {
            "1": {amount: "352", explanations: [[52.00,"GEZ",15],[100.00,"Betrag für die Woche",am 1.Montag]]},
            "2": {amount: "352", explanations: [[52.00,"GEZ",15],[100.00,"Betrag für die Woche",am 1.Montag]]},
            // ...
            "16": {amount: "100", explanations: [[100.00,"Betrag für die Woche",am 3.Montag]]},
        }, optional: [[50.00,"Physio Benny"]] }
    */

    /* UI
        const today = new Date();
        const {amount, explanations} = model[today.getDate()];
        <div>{amount}</div>
        explanations.map(([amount, description]) => {<div>{date}: {description} ({amount})</div>});
     */
});

function everyMonday100Bugs() {
    return [[100.00, "1. Mal Kohle"]]
}
