---
name: generate-problem
description: Generates a complete interview problem with test suites, user-approved concept proposal, and mandatory quality checklist.
---

# Generate Problem

## What This Skill Does

Generates a complete interview problem — `problem.json`, `suite.test.js`, and optionally `suite.test.py` — and writes it to `problems/`. The process has two phases: a concept proposal that requires user approval, then full file generation with a mandatory quality gate. The generated problem is immediately available in the CLI.

## Before You Begin

1. Read `.agents/context/problem-authoring-guide.md` — completely. Every rule in this document is mandatory.
2. Read `.agents/context/difficulty-guide.md` — completely. You will use the dimension definitions and calibration anchors for difficulty rating.
3. Read `.agents/context/style-guide.md` — completely. You will use the style definitions and checklists for style application.
4. Read `.agents/templates/problem-schema-template.json` — the structural reference for `problem.json`.
5. Read `config.json` at the repo root. If it does not exist, stop immediately and tell the user: "config.json not found. Please run /setup-config first." Do not proceed without a valid config.
6. Read all existing `problem.json` files in `problems/` — list every problem's title, topics, and core concept. You must not generate a problem with the same core concept as an existing problem.

## Steps

1. **Determine generation parameters.**

   Begin by reading `config.json`. Then examine everything the user provided with this invocation — structured overrides, free-form text, pasted content, interview prep notes, or any natural language description.

   **Parse user input first, before touching config or running any script:**

   If the user provided any input beyond the bare `/generate-problem` command, treat it as potential parameter signal regardless of format. Extract:
   - Topic or concept signals — any CS concept, domain, data structure, or problem type mentioned
   - Style signals — abstract/algorithmic language suggests LeetCode; business domain, system descriptions, or scenario narratives suggest real-world
   - Difficulty signals — words like "easy," "basic," "warm-up" map to lower ranges; "senior," "tricky," "advanced" map to higher ranges
   - Part count signals — "quick," "single function," "one thing" suggest 1 part; "then extend," "multi-step," "follow-up" suggest 2-3 parts
   - Time signals — any mention of interview duration or time pressure maps to `expectedMinutes`

   Map extracted signals to generation parameters. If a signal is ambiguous, prefer the user's stated intent over config defaults.

   **Apply parameters in this precedence order — strictly:**

   1. Explicit structured user overrides (highest priority — always win)
   2. Parameters extracted and inferred from free-form user input
   3. `surpriseMode` random selection — only for dimensions not covered by steps 1 or 2
   4. `config.json` defaults (lowest priority)

   `hideProblemDetails` is orthogonal to all of the above. It controls output behavior, not parameter selection. Determine it from config and apply it throughout all subsequent steps regardless of how parameters were selected.

   **For parameters not covered by user input:**

   a. If `surpriseMode.enabled` is true: run `node .agents/scripts/randomize-params.js` from the repo root. Use its output only for dimensions not already determined by user input. Log the seed: "Using seed [N]."

   b. If `surpriseMode.enabled` is false: ask the user interactively for each remaining parameter dimension. Walk through them conversationally, one at a time.

   **Enforce `maxPartsGlobal`** as a hard ceiling regardless of parameter source. If user input implies more parts than `maxPartsGlobal`, cap it silently and note the cap in any confirmation shown.

   **After determining all parameters:**

   - If the user provided free-form input AND `hideProblemDetails.enabled` is false: show a one-sentence confirmation of how you interpreted their input (e.g. "I read that as: real-world style, JSON traversal topic, single part.") and wait for a brief acknowledgment before proceeding.
   - If the user provided free-form input AND `hideProblemDetails.enabled` is true: show only "Understood — generating now." Do not echo back any inferred parameters.
   - If the user provided no input and `surpriseMode.enabled` is true: proceed directly to Step 2 with no confirmation.
   - If the user provided no input and `surpriseMode.enabled` is false: you have already collected parameters interactively, proceed to Step 2.

2. **Research the concept.**

   Before writing any problem content, verify your understanding of the CS concept, algorithm, data structure, or real-world domain this problem will involve. Internally articulate:
   - What is the core concept and what are its defining properties?
   - What are the correct implementations and their time/space complexity?
   - What are common mistakes and misconceptions?
   - If real-world style: what realistic data shapes and constraints does this domain have?

   If you are uncertain about any aspect of the concept's correctness, state your uncertainty to the user and ask for clarification before proceeding. Do not generate a problem about a concept you are not confident you understand accurately.

3. **Generate and present concept proposal.**

   Generate the full concept internally — working title, description, parts overview, difficulty object with justifications, and expected minutes — following all authoring rules. Then present the proposal based on the `hideProblemDetails` config.

   **If `hideProblemDetails.enabled` is false:**

   Present the full proposal to the user:

   a. **Working title** — must follow information hiding rules from `problem-authoring-guide.md` Section 1, Rule 1. Use domain language, no algorithm names, no data structure names, no structural signals.

   b. **Description** — one paragraph describing the problem space in the chosen style. Follow Rule 2 from the authoring guide. Reference `style-guide.md` for the selected style's characteristics.

   c. **Parts overview** — the number of parts and a one-sentence description of what each part asks the user to build. Describe the output/behavior, not the implementation approach.

   d. **Difficulty object** — all four fields with a one-sentence justification for each dimension rating. Reference the calibration problems in `difficulty-guide.md` Section 3 to anchor your ratings (e.g. "algorithmComplexity 3: similar to Course Schedule — requires BFS/DFS on a graph").

   e. **Expected minutes** — the value, with a brief note on how it relates to the difficulty.

   Present this proposal and ask: "Does this concept look good, or would you like any changes?" Wait for explicit approval. If the user requests changes, revise the proposal and present it again. Do not proceed to step 4 without approval.

   **If `hideProblemDetails.enabled` is true:**

   Keep the full proposal internal — you still need it for accurate generation. Do not show the title, part count, part descriptions, difficulty details, or any concept-specific information to the user. The master switch overrides all individual `hide*` sub-flags. Show only a brief confirmation prompt:

   - If `surpriseMode.enabled` is true: "I have a problem ready. Shall I proceed with generation?"
   - If `surpriseMode.enabled` is false (user specified parameters interactively): "Ready to generate. Shall I proceed?"

   Wait for explicit user confirmation before proceeding. Do not proceed to step 4 without approval.

4. **Confirm language.**

   Ask: "Generate test suite for JavaScript, Python, or both?" Default to `config.json language.preference` if the user does not specify. Wait for response.

5. **Generate complete `problem.json`.**

   Build the full `problem.json` using `.agents/templates/problem-schema-template.json` as the structural reference. Ensure every field is present:
   - `title`, `description` — from the approved proposal.
   - `topics` — the selected topics as a lowercase string array.
   - `difficulty` — from the approved proposal. `overall` must be computed from the formula, never set manually.
   - `style` — `"leetcode"` or `"real-world"`.
   - `expectedMinutes` — from the approved proposal.
   - `generatedBy` — `"agent"`.
   - `generatedAt` — current ISO 8601 timestamp. Use the actual current time, not a placeholder.
   - `parts` — each part with `title`, `description`, `activeTests`, and `scaffold` (js and/or python). Follow all authoring rules:
     - Titles: Rule 3 (what to build, not how).
     - Descriptions: Rule 4 (input/output, not mechanism).
     - activeTests: Section 3 rules (accumulation, exact matching).
     - Scaffolds: Rule 6 and Section 4 (no hints, additive exports for Part 2+).

6. **Generate test suite(s).**

   For each selected language, write a complete suite file following `problem-authoring-guide.md` Section 5:
   - All tests for all parts in a single file (`suite.test.js` and/or `suite.test.py`).
   - Jest file imports from `../../workspace/<name>/main`.
   - pytest file uses `sys.path.insert` at module level and function-local imports in every test function.
   - Test names describe observable behavior, not implementation (Rule 5).
   - Minimum coverage per part: one basic case, one empty/null/boundary input, two edge cases, one performance-adjacent case.
   - Every test name in the suite file must exactly match the corresponding string in `problem.json activeTests` — character for character.

7. **Run the self-check checklist.**

   This step is mandatory and cannot be abbreviated, skipped, or summarized. Go through every item in `problem-authoring-guide.md` Section 6 and verify the answer:

   1. Does the title contain any algorithm or data structure names? **Must be No.**
   2. Does the title or description reveal the number of parts? **Must be No.**
   3. Do any test names describe implementation rather than behavior? **Must be No.**
   4. Does any scaffold contain a hint toward the solution approach? **Must be No.**
   5. Does each part's `activeTests` include all prior parts' tests (unless intentionally deactivating one with documented reason)? **Must be Yes.**
   6. Does every string in `activeTests` exactly match a test name in the suite file — verified character by character? **Must be Yes.**
   7. Do all difficulty values fall within the configured ranges from `config.json`? **Must be Yes.**
   8. Is `expectedMinutes` within the `expectedTimeRange` from `config.json`? **Must be Yes.**
   9. Has the CS concept been verified for accuracy before encoding it in the problem? **Must be Yes.**
   10. Is `maxPartsGlobal` from `config.json` respected? **Must be Yes.**
   11. Does every test function in the suite file appear in at least one part's `activeTests`? **Must be Yes.**
   12. Does the Part 1 JS scaffold use `module.exports = { fn }` and do Part 2+ JS scaffolds use `module.exports.fn = fn`? **Must be Yes.**
   13. Do all pytest test functions use function-local imports (not module-level)? **Must be Yes.**
   14. Is `overall` computed from the formula, not estimated manually? **Must be Yes.**
   15. Does the problem directory name use lowercase-with-hyphens and match what the test files import from `workspace/<name>/main`? **Must be Yes.**

   If any item fails, revise the relevant file(s) and re-check the failing item(s). Do not write files until every item passes.

8. **Write files.**

   **If `hideProblemDetails.hideWriteOutput` is false OR `hideProblemDetails.enabled` is false:**

   Create the problem directory `problems/<kebab-case-name>/` and write files directly:
   - `problem.json`
   - `suite.test.js` (if JavaScript was selected)
   - `suite.test.py` (if Python was selected)

   Confirm exact file paths written to the user: "Files written: problems/<name>/problem.json, problems/<name>/suite.test.js"

   **If `hideProblemDetails.hideWriteOutput` is true AND `hideProblemDetails.enabled` is true:**

   Do not use the Write tool directly for any problem files. Instead:

   a. Construct a draft payload as a JSON object matching the schema expected by `.agents/scripts/write-problem.js`:
   ```json
   {
     "problemName": "<kebab-case-problem-name>",
     "files": [
       {
         "relativePath": "problems/<name>/problem.json",
         "content": "<complete file content as string>"
       },
       {
         "relativePath": "problems/<name>/suite.test.js",
         "content": "<complete file content as string>"
       }
     ]
   }
   ```
   Include only the files being generated (omit `suite.test.py` if Python was not selected).

   b. Create the `.agents/.draft/` directory if it does not exist.

   c. Write the payload to `.agents/.draft/pending.json`. This is the only direct file write in this branch — its content is a transit payload, not a readable problem file.

   d. Run `node .agents/scripts/write-problem.js` from the repo root. If it exits with a non-zero code, report the error from stderr to the user and stop.

   e. Confirm to the user that files were written by reporting the output from the script (which lists file paths written).

9. **Post-generation summary.**

   **If `hideProblemDetails.enabled` is false:**

   Tell the user:
   - The problem title
   - The language(s) generated
   - The `expectedMinutes` value
   - Topics, style, and overall difficulty
   - "Run `yarn start` and select this problem to begin."

   Never mention part count or per-part details in the summary, regardless of config.

   **If `hideProblemDetails.enabled` is true:**

   Tell the user only:
   - The problem title
   - The language(s) generated
   - The `expectedMinutes` value
   - "Run `yarn start` and select this problem to begin."

   Do not mention topics, style, part count, difficulty ratings, or any structural information about the problem. Do not mention that details are being hidden.

## Constraints

1. Never write files until the self-check checklist in step 7 passes completely. Every item must be verified.
2. Never begin full generation (steps 5-8) without explicit user approval of the concept proposal from step 3.
3. Never set part count above `maxPartsGlobal` from `config.json`.
4. Never use algorithm names, data structure names, or structural signals in problem titles or descriptions. Follow all information hiding rules from `problem-authoring-guide.md` Section 1.
5. `generatedAt` must be set to the actual current ISO 8601 timestamp, not a placeholder or empty string.
6. Do not generate a problem with the same core concept as an existing problem in `problems/`. If the randomized parameters point toward a concept that already exists, pick a different concept within the same topic/difficulty space.
7. The directory name under `problems/` must be lowercase-with-hyphens (kebab-case) derived from the title.
8. When `hideProblemDetails.enabled` is true, the master switch overrides all individual `hide*` sub-flags — behave as if all sub-flags are true regardless of their individual values.
9. When `hideProblemDetails.hideWriteOutput` is true, never use the Write tool directly for `problem.json`, `suite.test.js`, or `suite.test.py` — always route through `.agents/scripts/write-problem.js`.
10. Never echo back inferred parameters to the user when `hideProblemDetails.enabled` is true — not in confirmations, not in proposals, not in summaries.
11. User-provided input always takes precedence over config defaults and Surprise Me randomization for the dimensions it covers — never discard user context in favor of random selection.

## Output

- Files written to `problems/<name>/`: `problem.json`, and optionally `suite.test.js` and `suite.test.py`.
- Post-generation summary shown to the user.
