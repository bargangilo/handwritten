import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DRAFT_DIR = path.join(REPO_ROOT, ".agents", ".draft");
const PENDING_FILE = path.join(DRAFT_DIR, "pending.json");

try {
  // Read and parse the draft payload
  if (!fs.existsSync(PENDING_FILE)) {
    process.stderr.write("Error: .agents/.draft/pending.json not found.\n");
    process.exit(1);
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(PENDING_FILE, "utf8"));
  } catch {
    process.stderr.write("Error: .agents/.draft/pending.json contains invalid JSON.\n");
    process.exit(1);
  }

  // Validate payload structure
  if (typeof payload.problemName !== "string" || !payload.problemName) {
    process.stderr.write("Error: payload is missing required field \"problemName\".\n");
    process.exit(1);
  }

  if (!Array.isArray(payload.files) || payload.files.length === 0) {
    process.stderr.write("Error: payload \"files\" must be a non-empty array.\n");
    process.exit(1);
  }

  // Resolve and validate all paths before writing anything
  const resolvedFiles = payload.files.map((entry) => {
    const fullPath = path.resolve(REPO_ROOT, entry.relativePath);
    const normalizedRoot = path.resolve(REPO_ROOT) + path.sep;
    if (!fullPath.startsWith(normalizedRoot) && fullPath !== path.resolve(REPO_ROOT)) {
      process.stderr.write(
        `Error: path traversal detected in "${entry.relativePath}". All paths must be within the repo root.\n`
      );
      process.exit(1);
    }
    return { fullPath, content: entry.content };
  });

  // Write all files
  for (const { fullPath, content } of resolvedFiles) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf8");
  }

  // Extract scaffold stub files from problem.json
  const problemJsonFile = resolvedFiles.find((f) => f.fullPath.endsWith("problem.json"));
  if (problemJsonFile) {
    try {
      const problemConfig = JSON.parse(problemJsonFile.content);
      const problemDir = path.dirname(problemJsonFile.fullPath);
      if (Array.isArray(problemConfig.parts) && problemConfig.parts.length > 0) {
        const scaffold = problemConfig.parts[0].scaffold;
        if (scaffold) {
          if (typeof scaffold.js === "string") {
            const stubPath = path.join(problemDir, "main.js");
            fs.writeFileSync(stubPath, scaffold.js, "utf8");
            resolvedFiles.push({ fullPath: stubPath });
          }
          if (typeof scaffold.python === "string") {
            const stubPath = path.join(problemDir, "main.py");
            fs.writeFileSync(stubPath, scaffold.python, "utf8");
            resolvedFiles.push({ fullPath: stubPath });
          }
        }
      }
    } catch {
      // problem.json content is not valid JSON — skip scaffold extraction
    }
  }

  // Clean up draft
  fs.unlinkSync(PENDING_FILE);
  try {
    fs.rmdirSync(DRAFT_DIR);
  } catch {
    // Directory may not be empty if .gitkeep exists — that is fine
  }

  // Success output
  const written = resolvedFiles.map((f) => f.fullPath).join("\n");
  process.stdout.write(`Files written:\n${written}\n`);
  process.exit(0);
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
}
