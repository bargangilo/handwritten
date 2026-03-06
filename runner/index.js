import React from "react";
import { render } from "ink";
import { fileURLToPath } from "url";
import path from "path";
import App from "./app.jsx";

const nodeMajor = parseInt(process.version.slice(1).split(".")[0], 10);
if (nodeMajor < 18) {
  process.stderr.write(
    `Warning: Handwritten requires Node 18 or later. You are running ${process.version}.\n`
  );
  process.exit(1);
}
if (nodeMajor > 22) {
  process.stderr.write(
    `Warning: Handwritten is tested on Node 18–22. You are running ${process.version}. ` +
    `If you encounter unexpected crashes, try switching to Node 22 via your version manager.\n`
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const { waitUntilExit } = render(React.createElement(App, { rootDir: ROOT_DIR }));
await waitUntilExit();
process.exit(0);
