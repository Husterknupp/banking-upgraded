const { getWeeklyBudgetForComingWeeks } = require("./payDayCalculator");

describe("getWeeklyBudgetForComingWeeks", () => {
  it("should find 3 paydays for a 4-weeks month even when the last payday is not considered", () => {
    const result = getWeeklyBudgetForComingWeeks(new Date(2019, 8, 7));

    expect(result).toHaveLength(3);
    expect(result[0][2]).toBe(9);
    expect(result[1][2]).toBe(16);
    expect(result[2][2]).toBe(23);
  });
});
