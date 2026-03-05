#!/usr/bin/env bash
set -euo pipefail

# Generates screenshots and GIFs from VHS tape files.
#
# Usage:
#   scripts/generate-media.sh              # run all tapes
#   scripts/generate-media.sh --dry-run    # show what would happen
#   scripts/generate-media.sh --tape main-menu --tape settings-menu

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# --- Argument parsing ---

DRY_RUN=false
declare -a TAPE_NAMES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --tape)
      if [[ -z "${2:-}" ]]; then
        echo "Error: --tape requires a name argument."
        exit 1
      fi
      TAPE_NAMES+=("$2")
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: $0 [--dry-run] [--tape <name> ...]"
      exit 1
      ;;
  esac
done

# --- Preflight checks ---

if ! command -v vhs &>/dev/null; then
  echo "Error: vhs not found on PATH."
  echo "Install VHS: https://github.com/charmbracelet/vhs"
  exit 1
fi

if ! command -v yarn &>/dev/null; then
  echo "Error: yarn not found on PATH."
  exit 1
fi

if [[ ! -f "$REPO_ROOT/media/fixtures/config.json" ]]; then
  echo "Error: media/fixtures/config.json not found."
  exit 1
fi

# --- Determine tapes to run ---

declare -a TAPE_FILES=()

if [[ ${#TAPE_NAMES[@]} -gt 0 ]]; then
  for name in "${TAPE_NAMES[@]}"; do
    tape_file="$REPO_ROOT/media/tapes/${name}.tape"
    if [[ -f "$tape_file" ]]; then
      TAPE_FILES+=("$tape_file")
    else
      echo "Warning: no tape file found for '${name}' (expected ${tape_file})"
    fi
  done
else
  # All tapes in alphabetical order
  while IFS= read -r -d '' f; do
    TAPE_FILES+=("$f")
  done < <(find "$REPO_ROOT/media/tapes" -name '*.tape' -print0 | sort -z)
fi

if [[ ${#TAPE_FILES[@]} -eq 0 ]]; then
  echo "No tape files to run."
  exit 0
fi

# --- Dry run ---

if [[ "$DRY_RUN" == true ]]; then
  echo "Dry run — no files will be modified."
  echo ""
  echo "Tapes to record:"
  for tape_file in "${TAPE_FILES[@]}"; do
    tape_name=$(basename "$tape_file" .tape)
    echo "  $tape_name ($tape_file)"
    # Extract Output and Screenshot paths from the tape
    grep -E '^\s*(Output|Screenshot)\s+' "$tape_file" | while read -r line; do
      echo "    → $line"
    done
  done
  echo ""
  echo "Output directory: media/output/"
  exit 0
fi

# --- Back up real state ---

BACKUP_DIR=$(mktemp -d)
echo "Backing up real state to $BACKUP_DIR"

if [[ -f "$REPO_ROOT/config.json" ]]; then
  cp "$REPO_ROOT/config.json" "$BACKUP_DIR/config.json"
fi

if [[ -d "$REPO_ROOT/workspace" ]]; then
  cp -r "$REPO_ROOT/workspace" "$BACKUP_DIR/workspace"
fi

cleanup() {
  echo ""
  echo "Restoring real state..."
  if [[ -f "$BACKUP_DIR/config.json" ]]; then
    cp "$BACKUP_DIR/config.json" "$REPO_ROOT/config.json"
  else
    rm -f "$REPO_ROOT/config.json"
  fi
  if [[ -d "$BACKUP_DIR/workspace" ]]; then
    rm -rf "$REPO_ROOT/workspace"
    cp -r "$BACKUP_DIR/workspace" "$REPO_ROOT/workspace"
  else
    rm -rf "$REPO_ROOT/workspace"
    mkdir -p "$REPO_ROOT/workspace"
    touch "$REPO_ROOT/workspace/.gitkeep"
  fi
  rm -rf "$BACKUP_DIR"
  echo "Restore complete."
}
trap cleanup EXIT

# --- Install fixture state ---

echo "Installing fixture state..."
cp "$REPO_ROOT/media/fixtures/config.json" "$REPO_ROOT/config.json"

mkdir -p "$REPO_ROOT/workspace"
for fixture_workspace in "$REPO_ROOT/media/fixtures/workspace"/*/; do
  if [[ -d "$fixture_workspace" ]]; then
    name=$(basename "$fixture_workspace")
    mkdir -p "$REPO_ROOT/workspace/$name"
    cp -r "$fixture_workspace"* "$REPO_ROOT/workspace/$name/"
  fi
done

# --- Run tapes ---

RECORDED=0
FAILED=0
declare -a FAILED_TAPES=()

for tape_file in "${TAPE_FILES[@]}"; do
  tape_name=$(basename "$tape_file" .tape)
  echo ""
  echo "Recording: $tape_name"
  if vhs "$tape_file"; then
    RECORDED=$((RECORDED + 1))
  else
    echo "  FAILED: $tape_name"
    FAILED=$((FAILED + 1))
    FAILED_TAPES+=("$tape_name")
  fi
done

# --- Verify README media references ---

echo ""
echo "Verifying README media references..."
MISSING=0
while IFS= read -r ref; do
  if [[ ! -f "$REPO_ROOT/$ref" ]]; then
    echo "  WARNING: README references $ref but file does not exist"
    MISSING=$((MISSING + 1))
  fi
done < <(grep -oE 'media/output/[^ )]+' "$REPO_ROOT/README.md" 2>/dev/null || true)

if [[ $MISSING -eq 0 ]]; then
  echo "  All media/output/ references verified."
fi

# --- Summary ---

echo ""
echo "Media generation complete."
echo "  Recorded: $RECORDED tapes"
echo "  Failed: $FAILED"
echo "  Output: media/output/"

if [[ $FAILED -gt 0 ]]; then
  echo ""
  echo "Failed tapes:"
  for name in "${FAILED_TAPES[@]}"; do
    echo "  - $name"
  done
  exit 1
fi
