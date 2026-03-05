---
name: handwritten-config
description: Creates or updates config.json through a guided conversation covering topics, difficulty, style, and timing.
---

# Setup Config

## What This Skill Does

Creates or updates the user's `config.json` file through a guided conversation. This file controls how problems are generated — topics, difficulty ranges, style preferences, part counts, timing, and Surprise Me mode. The skill walks the user through each setting, explains what it controls, and writes the final config only after explicit confirmation.

## Before You Begin

1. Read `.agents/config-schema.json` — this is the single source of truth for all config field definitions. All field labels, descriptions, options, defaults, and recommendations are sourced from this file. Do not hardcode them in the skill.
2. Read `.agents/templates/config-template.json` — this is the structural base for the output file.
3. Read `.agents/context/difficulty-guide.md` Section 1 (Dimension Definitions) — you will reference these definitions when explaining difficulty settings to the user.

## Steps

1. **Check for existing config.** Look for `config.json` at the repo root.
   - If it exists: read it, display a human-readable summary of all current settings in plain English (not raw JSON), then present a two-option interactive choice — do not ask this as a free-text question:
     - "Update specific settings"
     - "Start from scratch"
     If the user selects "Update specific settings", present the available section labels from `config-schema.json` as an interactive choice and ask which section they want to update. Jump directly to that section in step 2.
   - If it does not exist: greet the user and explain: "This skill will create your config.json, which controls how problems are generated for you — topics, difficulty, style, timing, and more. I'll walk you through each setting." Proceed to step 2.

2. **Walk through each configuration section in order.** Process each section from `config-schema.json` sequentially. For each section, display its `label` and `description` to introduce it. Then present each field using the rules below. Parse all user input as natural language — never ask them to type JSON.

   **Field presentation rules by type:**

   - **`single-select`**: Present as a clickable interactive choice using the field's `options` array. Show each option's `label` and `description`. Mark the `recommended` option clearly if one exists.
   - **`multi-select`**: Present as a multi-select choice using the field's `options` array.
   - **`boolean`**: Present as a two-option clickable choice: Yes / No. Mark the `recommended` option if one exists.
   - **`range`**: Ask as a free-text question (ranges are naturally expressed as "1-3" or "2-4"). Show the `min` and `max` bounds from the schema. If the user expresses a goal instead of numbers (e.g. "medium difficulty"), translate it into appropriate values, state them, and confirm.
   - **`minute-range`**: Same as `range` — ask as free-text showing the bounds.
   - **`integer`**: Ask as free-text showing the valid range. Show the `recommended` value if one exists.
   - **`topic-list`**: Ask as free-text, accepting a comma-separated list, a sentence, or any natural format. Validate that every provided topic is a real, meaningful CS or programming concept. If something seems unclear, misspelled, or too vague (e.g. "hard stuff"), confirm with the user: "Did you mean [X]? Or could you be more specific?"
   - **`topic-avoid-list`**: Ask as free-text. After collecting the avoid list, remove any topic from the `include` list that also appears in the `avoid` list. This deduplication happens silently — do not mention it to the user unless the entire include list would become empty, in which case ask them to reconsider their avoid list. The final `config.json` must never contain the same topic in both `topics.include` and `topics.avoid`.

   **Dependency handling:** Skip any field where `dependsOn` references a field whose current value does not satisfy the dependency (e.g. skip the `hide*` sub-flags if `hideProblemDetails.enabled` was set to false).

   **Difficulty section special handling:** When presenting difficulty range fields, display the full level breakdown from `difficulty-guide.md` Section 1 before asking for the range. This is the one place where the skill supplements the schema with external context. Present all five levels for each dimension so the user can make an informed choice.

3. **Display full summary.** After all sections are collected, display a complete human-readable summary of the full configuration in plain English. Example format:
   ```
   Topics: arrays, hash maps, trees, dynamic programming, strings
   Avoid: graphs
   Algorithm complexity: 1-3
   Data structure complexity: 1-3
   Problem complexity: 2-4
   Style: mixed (LeetCode and real-world)
   Languages: JavaScript and Python
   Parts: 1-3 (max 3)
   Surprise Me: enabled (parameters chosen randomly)
   Hide details: enabled (topics hidden, style hidden, part count hidden, file output hidden)
   Time range: 20-45 minutes
   ```
   Ask: "Does this look right? Type yes to save, or describe what you'd like to change."

4. **Handle change requests.** If the user requests changes, return to only the relevant section(s) in step 2 and repeat. Do not restart the entire conversation. After changes, display the updated summary again and re-confirm.

5. **Write the file.** Once the user explicitly confirms, write `config.json` to the repo root. Use `.agents/templates/config-template.json` as the structural base. Set `createdAt` to the current ISO 8601 timestamp if this is a new file. Set `updatedAt` to the current ISO 8601 timestamp always.

6. **Confirm to the user:** "config.json has been saved. You can re-run /handwritten-config at any time to update your preferences. Run /handwritten-generate to create your first problem."

## Constraints

1. Never write `config.json` without explicit user confirmation of the full configuration summary.
2. Never set `maxPartsGlobal` above 6. If the user requests higher, explain: "The maximum supported value is 6. Problems with more than 6 parts tend to be too long for timed practice sessions."
3. `parts.countRange[1]` must never exceed `maxPartsGlobal`. If the user sets a range upper bound higher than their maxPartsGlobal, silently cap it and inform them.
4. Topics must be real CS/programming concepts. Do not accept arbitrary strings without confirming with the user.
5. Always set `createdAt` (on new file creation only) and `updatedAt` as ISO 8601 timestamps.
6. Parse all user input as natural language. Never ask the user to type JSON, arrays, or config syntax.
7. The `topics.include` array must never contain a topic that also appears in `topics.avoid`. Apply deduplication after collecting the avoid list and before writing the file.

## Output

- One file written: `config.json` at the repo root.
- Confirmation message shown to the user after writing.
