/**
 * Find the best available meeting room for each request.
 *
 * @param {{id: string, capacity: number}[]} rooms - Available rooms
 * @param {{roomId: string, start: number, end: number}[]} bookings - Existing bookings
 * @param {{start: number, end: number, minCapacity: number}[]} requests - Meeting requests
 * @returns {(string|null)[]} Room ID for each request, or null if no room available
 */
function findRooms(rooms, bookings, requests) {
  // TODO: implement
}

module.exports = { findRooms };
