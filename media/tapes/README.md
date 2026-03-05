# VHS Tape Reference

Each tape records a distinct CLI screen or flow and produces one or more output files.

| Tape | Records | Outputs |
|---|---|---|
| `main-menu.tape` | Main menu at rest | `main-menu.gif`, `main-menu.png` |
| `problem-select.tape` | Problem picker with status badges | `problem-select.gif`, `problem-select.png` |
| `session-active.tape` | Active session with timer and test results | `session-active.gif`, `session-active.png` |
| `settings-menu.tape` | Full settings navigation: menu, section, edit, back | `settings-menu.gif`, `settings-menu.png` |
| `settings-edit.tape` | Focused field editing in the Topics section | `settings-edit.gif`, `settings-edit.png` |

Run all tapes: `yarn media`

Run a single tape: `yarn media -- --tape settings-menu`

Dry run: `yarn media:dry-run`

Tapes use `Sleep` for timing between interactions. If UI rendering is slower or faster on your machine, adjust the sleep durations in the tape files. The `session-active.tape` schedules a background file touch to trigger the test watcher mid-recording — adjust its delay if the session screen has not appeared by the time it fires.
