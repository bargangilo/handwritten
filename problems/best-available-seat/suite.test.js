const mod = require("../../workspace/best-available-seat/main");

describe("findBestSeats", () => {
  test("finds best seat for each budget", () => {
    const prices = [50, 30, 80, 20, 60];
    const budgets = [45, 70, 10];
    expect(mod.findBestSeats(prices, budgets)).toEqual([30, 60, -1]);
  });

  test("returns negative one when no seat is affordable", () => {
    const prices = [100, 200, 300];
    const budgets = [50, 99];
    expect(mod.findBestSeats(prices, budgets)).toEqual([-1, -1]);
  });

  test("exact budget match returns that price", () => {
    const prices = [10, 25, 50, 75];
    const budgets = [50, 25];
    expect(mod.findBestSeats(prices, budgets)).toEqual([50, 25]);
  });

  test("returns most expensive when all are affordable", () => {
    const prices = [5, 10, 15];
    const budgets = [100, 20];
    expect(mod.findBestSeats(prices, budgets)).toEqual([15, 15]);
  });

  test("empty price list returns all negative ones", () => {
    const prices = [];
    const budgets = [10, 20, 30];
    expect(mod.findBestSeats(prices, budgets)).toEqual([-1, -1, -1]);
  });

  test("handles many seats and budgets", () => {
    const prices = Array.from({ length: 10000 }, (_, i) => i + 1);
    const budgets = [5000, 9999, 1, 10000, 0];
    expect(mod.findBestSeats(prices, budgets)).toEqual([5000, 9999, 1, 10000, -1]);
  });
});
