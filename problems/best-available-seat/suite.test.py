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


def test_output_array_length_matches_budgets_array_length():
    from main import find_best_seats
    prices = [20, 40, 60]
    budgets = [10, 50, 30, 70]
    result = find_best_seats(prices, budgets)
    assert len(result) == 4
    assert result == [-1, 40, 20, 60]


def test_single_budget_with_single_price_within_budget():
    from main import find_best_seats
    prices = [25]
    budgets = [30]
    assert find_best_seats(prices, budgets) == [25]


def test_duplicate_prices_returns_highest_affordable_price():
    from main import find_best_seats
    prices = [30, 30, 50, 50]
    budgets = [35, 55]
    assert find_best_seats(prices, budgets) == [30, 50]


def test_selects_most_expensive_affordable_not_first_affordable():
    from main import find_best_seats
    prices = [10, 90, 50, 30, 70]
    budgets = [60]
    assert find_best_seats(prices, budgets) == [50]


def test_budget_of_zero_with_all_positive_prices_returns_negative_one():
    from main import find_best_seats
    prices = [1, 5, 10]
    budgets = [0]
    assert find_best_seats(prices, budgets) == [-1]
