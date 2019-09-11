import React, { useEffect, useState } from "react";
import "./App.css";

interface Response {
  forSure: ForSure;
  date: {
    currentMonth: number;
    dateDayOfTheMonth: number;
    dayOfTheWeek: number;
    daysOFCurrentMonth: number;
    year: number;
  };
  optional: Array<Expense>;
}

interface ForSure {
  [dayOfTheMonth: string]: Array<Expense>;
}

/*
  [
    amount:number,
    description:string,
    date:number|undefined,
    optional:string|undefined,
  ]
 */
type Expense = [number, string, number?, "optional"?];

const App: React.FC = () => {
  const [date, setDate] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [forSure, setForSure] = useState<ForSure | null>(null);
  const displayDate = new Date();

  useEffect(() => {
    (async () => {
      const request = await fetch("/whatElseIsComing");
      const { forSure, date } = (await request.json()) as Response;
      setForSure(forSure);
      setDate(date.dateDayOfTheMonth);
      setMonth(date.currentMonth);
    })();
  }, []);

  let expenses;
  let expensesSummarized;
  if (forSure) {
    expenses = forSure[displayDate.getDate().toString()];
    expensesSummarized =
      Math.round(expenses.reduce((prev, [amount]) => prev + amount, 0) * 100) /
      100;
  }

  if (expenses !== undefined && date && month) {
    return (
      <>
        <div style={{ display: "flex", margin: "3em" }}>
          <small style={{ marginRight: "1em" }}>
            {date}. {month}.
          </small>
          <div>
            <div style={{ fontWeight: "bold" }}>Wie viel geht noch ab?</div>
            <h2>€ {expensesSummarized}</h2>
            <ul>
              {expenses.map(([amount, description, dateHappening], idx) => {
                return (
                  <li style={{ margin: ".2em 0" }} key={idx}>
                    € {amount} (am {dateHappening}. für {description})
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </>
    );
  } else {
    return <div>🍌 nothing to show here</div>;
  }
};

export default App;
