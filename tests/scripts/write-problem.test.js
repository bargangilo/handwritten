import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

const REPO_ROOT = path.resolve(".");
const SCRIPT = path.join(REPO_ROOT, ".agents", "scripts", "write-problem.js");
const DRAFT_DIR = path.join(REPO_ROOT, ".agents", ".draft");
const PENDING_FILE = path.join(DRAFT_DIR, "pending.json");

// Use a temp directory under the repo for test output to avoid polluting real problems/
const TEST_OUTPUT_DIR = path.join(REPO_ROOT, ".agents", ".draft", "_test_output");

function runScript() {
  return spawnSync("node", [SCRIPT], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    timeout: 10000,
  });
}

function writePending(payload) {
  fs.mkdirSync(DRAFT_DIR, { recursive: true });
  fs.writeFileSync(PENDING_FILE, JSON.stringify(payload), "utf8");
}

function cleanup() {
  // Remove pending.json if it exists
  try { fs.unlinkSync(PENDING_FILE); } catch { /* ignore */ }
  // Remove test output dir
  try { fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  // Recreate .gitkeep if it was removed
  fs.mkdirSync(DRAFT_DIR, { recursive: true });
  const gitkeep = path.join(DRAFT_DIR, ".gitkeep");
  if (!fs.existsSync(gitkeep)) {
    fs.writeFileSync(gitkeep, "", "utf8");
  }
}

beforeEach(cleanup);
afterAll(cleanup);

describe("write-problem valid payload", () => {
  test("writes all files to correct paths", () => {
    const problemDir = path.join(TEST_OUTPUT_DIR, "test-problem");
    const payload = {
      problemName: "test-problem",
      files: [
        {
          relativePath: path.relative(REPO_ROOT, path.join(problemDir, "problem.json")),
          content: '{"title":"Test"}',
        },
        {
          relativePath: path.relative(REPO_ROOT, path.join(problemDir, "suite.test.js")),
          content: 'test("basic", () => {});',
        },
      ],
    };
    writePending(payload);

    const result = runScript();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Files written:");

    // Verify files exist with correct content
    expect(fs.readFileSync(path.join(problemDir, "problem.json"), "utf8")).toBe('{"title":"Test"}');
    expect(fs.readFileSync(path.join(problemDir, "suite.test.js"), "utf8")).toBe('test("basic", () => {});');
  });

  test("draft file and directory are cleaned up after successful write", () => {
    const problemDir = path.join(TEST_OUTPUT_DIR, "cleanup-test");
    const payload = {
      problemName: "cleanup-test",
      files: [
        {
          relativePath: path.relative(REPO_ROOT, path.join(problemDir, "problem.json")),
          content: '{}',
        },
      ],
    };
    writePending(payload);

    const result = runScript();
    expect(result.status).toBe(0);
    expect(fs.existsSync(PENDING_FILE)).toBe(false);
  });
});

describe("write-problem error handling", () => {
  test("missing pending.json exits with code 1", () => {
    // Ensure no pending.json exists
    try { fs.unlinkSync(PENDING_FILE); } catch { /* ignore */ }

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("pending.json not found");
  });

  test("invalid payload (missing problemName) exits with code 1", () => {
    writePending({ files: [{ relativePath: "foo.json", content: "{}" }] });

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("problemName");
  });

  test("invalid payload (empty files array) exits with code 1", () => {
    writePending({ problemName: "test", files: [] });

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("files");
  });

  test("path traversal attempt in relativePath is rejected", () => {
    writePending({
      problemName: "evil",
      files: [
        { relativePath: "../../../etc/passwd", content: "malicious" },
      ],
    });

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("path traversal");
  });

  test("partial failure exits with code 1 and does not leave partial state", () => {
    // Write a payload where the second file targets an unwritable path
    // We simulate this by making the first file valid and the second one trigger
    // a path traversal error (validated before any writes happen)
    const problemDir = path.join(TEST_OUTPUT_DIR, "partial-test");
    writePending({
      problemName: "partial-test",
      files: [
        {
          relativePath: path.relative(REPO_ROOT, path.join(problemDir, "good.json")),
          content: '{"ok":true}',
        },
        { relativePath: "../../../tmp/evil.json", content: "bad" },
      ],
    });

    const result = runScript();
    expect(result.status).toBe(1);
    // The first file should NOT have been written because validation happens before writing
    expect(fs.existsSync(path.join(problemDir, "good.json"))).toBe(false);
  });
});
