# Captures the main menu screenshot for docs/media/main-menu.png
#
# Run from the repo root:
#   vhs docs/media/tapes/main-menu.tape
#
# Prerequisites:
#   - yarn install has been run
#   - At least one problem exists in problems/

# Output a throwaway GIF (VHS requires Output); the screenshot is the real artifact.
Output docs/media/main-menu.gif

Set Theme "Dracula"
Set Width 800
Set Height 500
Set FontSize 28
Set Padding 10

Type "yarn start"
Enter
Sleep 3s

Screenshot docs/media/main-menu.png
