import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "workspace", "best-available-seat"))


def test_finds_best_seat_for_each_budget():
    from main import find_best_seats
    prices = [50, 30, 80, 20, 60]
    budgets = [45, 70, 10]
    assert find_best_seats(prices, budgets) == [30, 60, -1]


def test_returns_negative_one_when_no_seat_is_affordable():
    from main import find_best_seats
    prices = [100, 200, 300]
    budgets = [50, 99]
    assert find_best_seats(prices, budgets) == [-1, -1]


def test_exact_budget_match_returns_that_price():
    from main import find_best_seats
    prices = [10, 25, 50, 75]
    budgets = [50, 25]
    assert find_best_seats(prices, budgets) == [50, 25]


def test_returns_most_expensive_when_all_are_affordable():
    from main import find_best_seats
    prices = [5, 10, 15]
    budgets = [100, 20]
    assert find_best_seats(prices, budgets) == [15, 15]


def test_empty_price_list_returns_all_negative_ones():
    from main import find_best_seats
    prices = []
    budgets = [10, 20, 30]
    assert find_best_seats(prices, budgets) == [-1, -1, -1]


def test_handles_many_seats_and_budgets():
    from main import find_best_seats
    prices = list(range(1, 10001))
    budgets = [5000, 9999, 1, 10000, 0]
    assert find_best_seats(prices, budgets) == [5000, 9999, 1, 10000, -1]
