import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "workspace", "meeting-room-finder"))


def test_assigns_smallest_room_that_fits():
    from main import find_rooms
    rooms = [
        {"id": "A", "capacity": 5},
        {"id": "B", "capacity": 10},
        {"id": "C", "capacity": 20},
    ]
    bookings = []
    requests = [{"start": 9, "end": 10, "min_capacity": 8}]
    assert find_rooms(rooms, bookings, requests) == ["B"]


def test_returns_null_when_no_room_has_enough_capacity():
    from main import find_rooms
    rooms = [
        {"id": "A", "capacity": 5},
        {"id": "B", "capacity": 10},
    ]
    bookings = []
    requests = [{"start": 9, "end": 10, "min_capacity": 15}]
    assert find_rooms(rooms, bookings, requests) == [None]


def test_skips_booked_rooms_during_requested_time():
    from main import find_rooms
    rooms = [
        {"id": "A", "capacity": 10},
        {"id": "B", "capacity": 15},
        {"id": "C", "capacity": 20},
    ]
    bookings = [{"room_id": "A", "start": 9, "end": 11}]
    requests = [{"start": 9, "end": 10, "min_capacity": 8}]
    assert find_rooms(rooms, bookings, requests) == ["B"]


def test_room_available_outside_booking_window():
    from main import find_rooms
    rooms = [
        {"id": "A", "capacity": 10},
        {"id": "B", "capacity": 20},
    ]
    bookings = [{"room_id": "A", "start": 14, "end": 16}]
    requests = [{"start": 9, "end": 11, "min_capacity": 5}]
    assert find_rooms(rooms, bookings, requests) == ["A"]


def test_empty_bookings_assigns_first_fitting_room():
    from main import find_rooms
    rooms = [
        {"id": "X", "capacity": 3},
        {"id": "Y", "capacity": 7},
        {"id": "Z", "capacity": 12},
    ]
    bookings = []
    requests = [
        {"start": 10, "end": 11, "min_capacity": 1},
        {"start": 12, "end": 13, "min_capacity": 10},
    ]
    assert find_rooms(rooms, bookings, requests) == ["X", "Z"]


def test_handles_many_rooms_and_requests():
    from main import find_rooms
    rooms = [{"id": f"R{i}", "capacity": i} for i in range(1, 1001)]
    bookings = [{"room_id": f"R{i}", "start": 0, "end": 24} for i in range(1, 501)]
    requests = [{"start": 0, "end": 1, "min_capacity": 1} for _ in range(1000)]
    result = find_rooms(rooms, bookings, requests)
    assert len(result) == 1000
    assert result[0] == "R501"
