const mod = require("../../workspace/meeting-room-finder/main");

describe("findRooms", () => {
  test("assigns smallest room that fits", () => {
    const rooms = [
      { id: "A", capacity: 5 },
      { id: "B", capacity: 10 },
      { id: "C", capacity: 20 }
    ];
    const bookings = [];
    const requests = [{ start: 9, end: 10, minCapacity: 8 }];
    expect(mod.findRooms(rooms, bookings, requests)).toEqual(["B"]);
  });

  test("returns null when no room has enough capacity", () => {
    const rooms = [
      { id: "A", capacity: 5 },
      { id: "B", capacity: 10 }
    ];
    const bookings = [];
    const requests = [{ start: 9, end: 10, minCapacity: 15 }];
    expect(mod.findRooms(rooms, bookings, requests)).toEqual([null]);
  });

  test("skips booked rooms during requested time", () => {
    const rooms = [
      { id: "A", capacity: 10 },
      { id: "B", capacity: 15 },
      { id: "C", capacity: 20 }
    ];
    const bookings = [{ roomId: "A", start: 9, end: 11 }];
    const requests = [{ start: 9, end: 10, minCapacity: 8 }];
    expect(mod.findRooms(rooms, bookings, requests)).toEqual(["B"]);
  });

  test("room available outside booking window", () => {
    const rooms = [
      { id: "A", capacity: 10 },
      { id: "B", capacity: 20 }
    ];
    const bookings = [{ roomId: "A", start: 14, end: 16 }];
    const requests = [{ start: 9, end: 11, minCapacity: 5 }];
    expect(mod.findRooms(rooms, bookings, requests)).toEqual(["A"]);
  });

  test("empty bookings assigns first fitting room", () => {
    const rooms = [
      { id: "X", capacity: 3 },
      { id: "Y", capacity: 7 },
      { id: "Z", capacity: 12 }
    ];
    const bookings = [];
    const requests = [
      { start: 10, end: 11, minCapacity: 1 },
      { start: 12, end: 13, minCapacity: 10 }
    ];
    expect(mod.findRooms(rooms, bookings, requests)).toEqual(["X", "Z"]);
  });

  test("handles many rooms and requests", () => {
    const rooms = [];
    for (let i = 1; i <= 1000; i++) {
      rooms.push({ id: "R" + i, capacity: i });
    }
    const bookings = [];
    for (let i = 1; i <= 500; i++) {
      bookings.push({ roomId: "R" + i, start: 0, end: 24 });
    }
    const requests = [];
    for (let i = 0; i < 1000; i++) {
      requests.push({ start: 0, end: 1, minCapacity: 1 });
    }
    const result = mod.findRooms(rooms, bookings, requests);
    expect(result).toHaveLength(1000);
    expect(result[0]).toBe("R501");
  });
});
