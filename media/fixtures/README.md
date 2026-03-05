# Media Fixtures

These files define the known-good CLI state used during VHS tape recordings. The `config.json` provides a representative user configuration, and the `workspace/` directory contains a partially completed session for the sample problem — an in-progress `main.js` with a brute-force loop started but no return statement, and a `session.json` reflecting 8 minutes of stopwatch time on Part 1.

The regeneration script (`scripts/generate-media.sh`) backs up your real `config.json` and `workspace/` before recording, installs these fixtures in their place, runs all tapes, then restores your original state via an EXIT trap. Your real work is never modified or lost, even if VHS crashes mid-recording.

If the `session.json` or `config.json` schema changes, update the corresponding fixture files here to match the new schema. If a new problem is used in a tape, add its fixture workspace here with a realistic partial implementation and valid session state.
