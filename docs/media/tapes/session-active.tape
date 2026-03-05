# Captures an active coding session for docs/media/session-active.gif
#
# Run from the repo root:
#   vhs docs/media/tapes/session-active.tape
#
# Prerequisites:
#   - yarn install has been run
#   - No existing workspace/flatten-and-sum/ directory — delete it for a
#     clean recording (otherwise you will hit the Resume/Restart prompt)
#
# How it works:
#   A background process is scheduled (hidden from the recording) to append
#   a newline to the workspace file after the session starts. This triggers
#   the file watcher, which runs the test suite against the starter scaffold.
#   The tests will all fail (the scaffold has TODO stubs), producing a
#   realistic "0/5 passed" summary line — showing the save-and-test loop.

Output docs/media/session-active.gif

Set Theme "Dracula"
Set Width 1200
Set Height 700
Set FontSize 22
Set Padding 10

# Schedule a background file touch to trigger the watcher mid-session.
# Hidden so it does not appear in the recording.
Hide
# Type "(sleep 16 && echo '' >> workspace/flatten-and-sum/main.js) &"
Enter
Sleep 0.5s
Show

Type "yarn start"
Enter
Sleep 3s

# Main menu: Start a Problem (first item, already highlighted)
Enter
Sleep 3s

# Problem select: Flatten and Sum (first item)
Enter
Sleep 3s

# Language select: js (first item)
Enter
Sleep 3s

# Countdown prompt: press Enter for stopwatch mode
Enter
Sleep 3s


# The background touch fires around here — watcher runs tests, results appear
Enter
Sleep 5s
