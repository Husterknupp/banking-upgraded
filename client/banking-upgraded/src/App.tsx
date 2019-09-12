import React, { useState } from "react";

export default () => {
  const [documentResponse, setDocumentResponse] = useState<Response | null>(
    null
  );
  const [currentUrlInput, setCurrentUrlInput] = useState("");

  return !documentResponse ? (
    <DocumentRetrieval
      currentInputValue={currentUrlInput}
      onInputUpdate={(newInput: string) => setCurrentUrlInput(newInput)}
      onDocumentRetrieval={(documentResponse: Response) =>
        setDocumentResponse(documentResponse)
      }
    />
  ) : (
    <ComingExpenses document={documentResponse} />
  );
};

type DocumentRetrievalProps = {
  currentInputValue: string;
  onInputUpdate: (input: string) => void;
  onDocumentRetrieval: (documentResponse: Response) => void;
};

function DocumentRetrieval({
  currentInputValue,
  onInputUpdate,
  onDocumentRetrieval
}: DocumentRetrievalProps): JSX.Element {
  const loadDocumentFromBackend = async () => {
    const request = await fetch(
      `/whatElseIsComing?documentUrl=${currentInputValue}`
    );
    onDocumentRetrieval((await request.json()) as Response);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        textAlign: "center"
      }}
    >
      <input
        type={"text"}
        onChange={event => onInputUpdate(event.target.value)}
        placeholder={"dropbox url"}
        value={currentInputValue}
        style={{ marginTop: "46vh", fontSize: "xx-large" }}
        autoFocus={true}
        onKeyPress={({ which }) => which === 13 && loadDocumentFromBackend()}
      />
      <button
        onClick={loadDocumentFromBackend}
        style={{ fontSize: "xx-large" }}
      >
        {" "}
        Laden
      </button>
    </div>
  );
}

type ComingExpensesProps = {
  document: Response;
};
function ComingExpenses({ document }: ComingExpensesProps): JSX.Element {
  const { forSure, date } = document;
  const dayOfTheMonth = date.dateDayOfTheMonth;
  const month = date.currentMonth;
  const displayDate = new Date();

  let expenses;
  let expensesSummarized;
  if (forSure) {
    expenses = forSure[displayDate.getDate().toString()];
    expensesSummarized =
      Math.round(expenses.reduce((prev, [amount]) => prev + amount, 0) * 100) /
      100;
  }

  if (expenses !== undefined && dayOfTheMonth && month) {
    return (
      <>
        <div style={{ display: "flex", margin: "3em" }}>
          <small style={{ marginRight: "1em" }}>
            {dayOfTheMonth}. {month}.
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
    return (
      <div>
        <span role={"img"} aria-label={"boring banana"}>
          🍌
        </span>{" "}
        nothing to show here
      </div>
    );
  }
}

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
