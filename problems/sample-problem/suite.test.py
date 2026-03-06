import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "workspace", "sample-problem"))

# --- Part 1: Two Sum — Brute Force ---


def test_basic_case():
    from main import two_sum
    result = two_sum([2, 7, 11, 15], 9)
    assert sorted(result) == [0, 1]


def test_no_solution_returns_undefined_or_empty():
    from main import two_sum
    result = two_sum([1, 2, 3], 10)
    assert result is None or result == []


def test_duplicate_values():
    from main import two_sum
    result = two_sum([3, 3], 6)
    assert sorted(result) == [0, 1]


def test_pair_in_the_middle_of_a_larger_array():
    from main import two_sum
    result = two_sum([10, 20, 3, 7, 40, 50], 10)
    assert sorted(result) == [2, 3]


def test_target_is_zero_with_positive_and_negative_values():
    from main import two_sum
    result = two_sum([4, -4, 8, 2], 0)
    assert sorted(result) == [0, 1]


def test_does_not_use_same_element_twice_when_value_is_half_of_target():
    from main import two_sum
    result = two_sum([5, 3, 10, 7], 10)
    assert sorted(result) == [1, 3]


def test_two_element_array_that_sums_to_target():
    from main import two_sum
    result = two_sum([1, 4], 5)
    assert sorted(result) == [0, 1]


def test_solution_uses_last_element_in_array():
    from main import two_sum
    result = two_sum([8, 1, 3, 12, 6], 18)
    assert sorted(result) == [0, 3]


# --- Part 2: Two Sum — Optimized ---


def test_negative_numbers():
    from main import two_sum
    result = two_sum([-1, -2, -3, -4, -5], -8)
    assert sorted(result) == [2, 4]


def test_large_input():
    from main import two_sum
    nums = list(range(10000))
    result = two_sum(nums, 19997)
    assert sorted(result) == [9998, 9999]


# --- Part 3: Three Sum ---


def test_basic_three_sum():
    from main import three_sum
    result = three_sum([1, 2, 3, 4, 5], 9)
    sorted_result = [sorted(t) for t in result]
    sorted_result.sort()
    assert sorted_result == [[1, 3, 5], [2, 3, 4]]


def test_no_three_sum_solution():
    from main import three_sum
    result = three_sum([1, 2, 3], 100)
    assert result == []


def test_three_sum_with_duplicates():
    from main import three_sum
    result = three_sum([1, 1, 1, 2, 2, 3, 3], 6)
    sorted_result = [sorted(t) for t in result]
    sorted_result.sort()
    assert sorted_result == [[1, 2, 3]]


def test_three_sum_negative_numbers():
    from main import three_sum
    result = three_sum([-1, 0, 1, 2, -1, -4], 0)
    sorted_result = [sorted(t) for t in result]
    sorted_result.sort()
    assert sorted_result == [[-1, -1, 2], [-1, 0, 1]]


def test_three_sum_single_valid_triplet():
    from main import three_sum
    result = three_sum([1, 2, 3], 6)
    sorted_result = [sorted(t) for t in result]
    assert sorted_result == [[1, 2, 3]]


def test_three_sum_with_all_same_values():
    from main import three_sum
    result = three_sum([5, 5, 5, 5], 15)
    sorted_result = [sorted(t) for t in result]
    assert sorted_result == [[5, 5, 5]]


def test_three_sum_returns_empty_for_two_element_input():
    from main import three_sum
    result = three_sum([1, 2], 3)
    assert result == []


def test_three_sum_with_zeros():
    from main import three_sum
    result = three_sum([0, 0, 0, 0], 0)
    sorted_result = [sorted(t) for t in result]
    assert sorted_result == [[0, 0, 0]]
