/**
 * Two Sum
 *
 * Given an array of integers `nums` and an integer `target`,
 * return the indices of the two numbers that add up to `target`.
 *
 * You may assume each input has exactly one solution,
 * and you may not use the same element twice.
 *
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        // TODO: return the indices
      }
    }
  }
}

module.exports = { twoSum };
