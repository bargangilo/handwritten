# Timer and Stats Reference

Every practice session is timed, and every attempt is recorded. The timer tracks elapsed time with pause support and optional countdown budgets. Session state persists to disk every second and survives process interruptions. Stats aggregate across all problems and attempts, giving you a long-term view of your practice history.

## Timer Modes

### Stopwatch

The default mode. Counts up from zero with no limit. The summary line shows elapsed time:

```
Part 1 of 1 unlocked   ✔ 3 / 5 tests passing   [last run: 2:14:03 PM]  ⏱ 12:34 elapsed
```

### Countdown

Set at session start by entering a number of minutes. If the problem defines `expectedMinutes` in its `problem.json`, that value pre-populates the prompt — the user can accept it, change it, or clear it for stopwatch mode.

The timer counts down and changes color as time runs low:

| Remaining | Color |
|---|---|
| > 50% | Green |
| 25–50% | Yellow |
| < 25% | Red |

```
Part 1 of 1 unlocked   ✔ 3 / 5 tests passing   [last run: 2:14:03 PM]  ⏱ 18:22 remaining
```

When the countdown reaches zero, the session continues in overtime rather than stopping. The overtime notice prints once, and the timer switches to counting up:

```
⏱ Time's up — keep going or press Q to return to the menu
Part 1 of 1 unlocked   ✔ 3 / 5 tests passing   [last run: 2:14:03 PM]  ⏱ +02:14 overtime
```

## Pause Behavior

Press **P** during a session to pause the timer. Press **P** again to resume. While paused:

- The summary line shows `[paused]` next to the timer
- Paused time is tracked separately in `totalPausedSeconds` and excluded from all elapsed calculations
- File saves still trigger test runs — only the timer stops
- The timer state (including paused status) persists to `session.json`

If the process is killed while paused, the session file reflects the paused state. On resume, the CLI restores accumulated elapsed and paused time. The timer does not retroactively count time that passed while the process was not running — `lastStarted` records when the session began, but elapsed time is computed from accumulated segments, not wall-clock difference.

## Milestone Warnings

The CLI prints a one-time warning at specific time thresholds. Each milestone fires exactly once per session, even if the timer passes the threshold multiple times due to pause/resume cycles. The deduplication is tracked in memory (a Set of fired thresholds) and is not persisted — restarting the process resets milestone tracking.

### Stopwatch Milestones

Fires at exactly 15, 30, and 45 minutes elapsed.

### Countdown Milestones

Fires when elapsed time reaches 50% and 25% of the countdown budget. A third milestone fires at 100% (countdown expiry), which triggers the overtime notice.

## Session Persistence

### `session.json` Schema

Written to `workspace/<name>/session.json`. Created on first session start for a problem; updated on every timer tick and at session end.

| Field | Type | Description |
|---|---|---|
| `lastStarted` | ISO 8601 string | When the current or most recent session began |
| `totalElapsedSeconds` | number | Cumulative elapsed time excluding paused time |
| `currentPartElapsedSeconds` | number | Elapsed time since the current part began |
| `isPaused` | boolean | Whether the timer is currently paused |
| `pausedAt` | ISO 8601 string \| null | When the current pause began. `null` when not paused |
| `totalPausedSeconds` | number | Cumulative paused time across all pause/resume cycles |
| `mode` | `"stopwatch"` \| `"countdown"` | Timer mode for this session |
| `countdownSeconds` | number \| null | Total countdown budget in seconds. `null` in stopwatch mode |
| `completed` | boolean | Whether all parts were completed in this session |
| `currentPart` | number | 0-indexed current part |
| `splits` | array | Per-part completion records (see below) |
| `attempts` | array | Historical attempt records (see below) |

**Split object:** `{ part: number, elapsedSeconds: number, completedAt: string }` — recorded when the user advances past a part.

**Attempt object:** `{ date: string, totalSeconds: number, splits: array, completed: boolean, wasCountdown: boolean, countdownSeconds: number | null }` — appended when a session ends (Q key, Ctrl+C, or all-parts completion).

### Write Strategy

**Every timer tick (1 second):** An async write updates timer fields (`totalElapsedSeconds`, `currentPartElapsedSeconds`, `totalPausedSeconds`, `isPaused`, `pausedAt`). A pending-write guard prevents queue buildup — if the previous write has not finished, the current tick's write is silently skipped.

**Part progression:** Updates `currentPart` and appends to `splits`.

**Session end (Q key, all-parts completion, or SIGINT):** A synchronous write appends the current attempt to `attempts`, updates `completed`, and finalizes all fields. The SIGINT handler uses `writeFileSync` to guarantee the write completes before the process exits.

### Resume Behavior

When the user chooses "Resume where you left off", the CLI reads `session.json` and restores:

- Timer elapsed time (`totalElapsedSeconds`, `currentPartElapsedSeconds`, `totalPausedSeconds`)
- Timer mode and countdown budget
- Current part (inferred from delimiter comments in the workspace file, not from `session.json`)

The timer picks up from the restored elapsed time. No retroactive counting occurs — time that passed while the CLI was not running is not included.

## Stats Computation

### Global Stats

Computed by `computeGlobalStats()` in `runner/stats.js`. Reads all `session.json` files from `workspace/` subdirectories.

| Stat | Derivation |
|---|---|
| Total practice time | Sum of `totalSeconds` across all attempts in all sessions |
| Problems attempted | Count of problems with a `session.json` file |
| Problems completed | Count of problems with at least one attempt where `completed === true` |
| Average solve time | Mean of `totalSeconds` for completed attempts only. `null` if no completions exist |
| Best solve time | Minimum `totalSeconds` among completed attempts. `null` if no completions exist |
| Current streak | Consecutive calendar days ending today or yesterday with at least one attempt (see below) |

### Per-Problem Stats

Computed by `computeProblemStats()` from a single problem's `session.json`.

| Stat | Derivation |
|---|---|
| Attempts | Length of the `attempts` array |
| Completions | Count of attempts with `completed === true` |
| Best time | Shortest `totalSeconds` among completed attempts |
| Average time | Mean `totalSeconds` of completed attempts |
| Last attempted | Date of the most recent attempt |
| Attempt history | Chronological list of all attempts with date, time, completion status, and countdown info |
| Best splits | Per-part split times from the fastest completed attempt |

### Streak Calculation

A streak is the number of consecutive calendar days (in local time) ending today or yesterday that have at least one attempt across any problem. The streak counts from the most recent qualifying day backward — if today has an attempt, today is day 1; if today has no attempt but yesterday does, yesterday is day 1. If neither today nor yesterday has an attempt, the streak is 0. A day with an abandoned session (incomplete attempt) still counts toward the streak.

## Note for Problem Authors

The `expectedMinutes` field in `problem.json` pre-populates the countdown prompt when a user starts the problem. Set it to a realistic target time for a first successful attempt across all parts. It does not enforce a time limit — the user can modify or clear it at the prompt. This field is informational and helps users calibrate their expectations before starting.
