import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "workspace", "flatten-and-sum"))

# ---- Part 1: flatten_array ----


def test_already_flat_array():
    from main import flatten_array
    assert flatten_array([1, 2, 3]) == [1, 2, 3]


def test_single_level_nesting():
    from main import flatten_array
    assert flatten_array([1, [2, 3], 4]) == [1, 2, 3, 4]


def test_deep_nesting():
    from main import flatten_array
    assert flatten_array([1, [2, [3, [4, [5]]]]]) == [1, 2, 3, 4, 5]


def test_empty_array():
    from main import flatten_array
    assert flatten_array([]) == []


def test_mixed_depth():
    from main import flatten_array
    assert flatten_array([[1], 2, [[3]], [4, [5, 6]]]) == [1, 2, 3, 4, 5, 6]


def test_single_element_array():
    from main import flatten_array
    assert flatten_array([42]) == [42]


def test_empty_sub_arrays_mixed_with_values():
    from main import flatten_array
    assert flatten_array([[], 1, [[], 2], []]) == [1, 2]


def test_preserves_element_order_across_nesting_levels():
    from main import flatten_array
    assert flatten_array([[3, 1], [4], [[1, 5]]]) == [3, 1, 4, 1, 5]


# ---- Part 2: sum_nested ----


def test_single_number_nested_deep():
    from main import sum_nested
    assert sum_nested([[[[[42]]]]]) == 42


def test_multiple_numbers_across_depths():
    from main import sum_nested
    assert sum_nested([1, [2, [3]], 4]) == 10


def test_empty_nested_array():
    from main import sum_nested
    assert sum_nested([]) == 0


def test_all_zeros():
    from main import sum_nested
    assert sum_nested([0, [0, [0]], 0]) == 0


def test_large_nested_structure():
    from main import sum_nested
    assert sum_nested([1, [2, [3, [4, [5, [6, [7, [8, [9, [10]]]]]]]]]]]) == 55


def test_negative_numbers_sum_correctly():
    from main import sum_nested
    assert sum_nested([-1, [2, [-3]], 4]) == 2


def test_nested_empty_sub_arrays_sum_to_zero():
    from main import sum_nested
    assert sum_nested([[], [[]], [[[]]]]) == 0


def test_single_flat_number():
    from main import sum_nested
    assert sum_nested([7]) == 7
