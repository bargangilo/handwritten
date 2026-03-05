import React from "react";
import { Text } from "ink";
import { formatTimerSegment } from "../format.js";

function formatRunTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function SummaryLine({ passed, total, timestamp, partInfo, timerDisplay, runOutput, lastRunAt }) {
  const allPassing = passed === total && total > 0;

  // Compute run status from runOutput
  let runSegment = null;
  if (runOutput && runOutput.length > 0 && lastRunAt) {
    const timeStr = formatRunTime(lastRunAt);
    const first = runOutput[0];
    if (first.type === "timeout") {
      runSegment = <Text color="yellow">{"\u25B6"} timed out</Text>;
    } else if (first.type === "crashed") {
      runSegment = <Text color="red">{"\u25B6"} crashed</Text>;
    } else if (first.type === "skipped") {
      // Omit entirely
      runSegment = null;
    } else {
      // Count pass/fail from result entries with expected (passed !== null)
      const withExpected = runOutput.filter((e) => e.type === "result" && e.passed !== null);
      if (withExpected.length > 0) {
        const passCount = withExpected.filter((e) => e.passed).length;
        const allPass = passCount === withExpected.length;
        runSegment = (
          <Text>
            <Text color={allPass ? "green" : "red"}>
              {"\u25B6"} ran {timeStr}{"  "}{allPass ? "\u2714" : "\u2718"} {passCount}/{withExpected.length}
            </Text>
          </Text>
        );
      } else {
        runSegment = <Text>{"\u25B6"} ran {timeStr}</Text>;
      }
    }
  }

  return (
    <Text>
      {partInfo ? (
        <Text bold>{"  "}Part {partInfo.current} of {partInfo.unlocked} unlocked{"   "}</Text>
      ) : (
        <Text>{"  "}</Text>
      )}
      {runSegment ? <>{runSegment}{"  "}<Text dimColor>{"\u00B7"}</Text>{"  "}</> : null}
      <Text color={allPassing ? "green" : "yellow"}>{"\u2714"} {passed} / {total} tests</Text>
      {"  "}<Text dimColor>{"\u00B7"}</Text>{"  "}
      <Text dimColor>T to test</Text>
      {timerDisplay ? <Text>{"  "}{formatTimerSegment(timerDisplay)}</Text> : null}
    </Text>
  );
}
