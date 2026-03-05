import React from "react";
import { Text, useInput } from "ink";
import { Action } from "../state.js";

export default function ProblemListDetail({ dispatch, problem, config, status }) {
  useInput(() => {
    dispatch({ type: Action.BACK });
  });

  const parts = config.parts ? config.parts.length : 1;

  return (
    <>
      <Text bold>{"\n  "}{config.title}</Text>
      <Text color="gray">{"  "}{"─".repeat(config.title.length)}</Text>
      <Text>{"  "}{parts} parts</Text>
      {status ? (
        <Text>
          {"  "}Status: {status === "complete" ? (
            <Text color="green">{status}</Text>
          ) : (
            <Text color="yellow">{status}</Text>
          )}
        </Text>
      ) : null}
      {config.description ? (
        <Text color="gray">{"\n  "}{config.description}</Text>
      ) : null}

      {config.parts ? (
        <>
          <Text>{""}</Text>
          {config.parts.map((part, i) => {
            const examples = (part.runInputs || []).filter(
              (r) => r && r.function && r.label && Array.isArray(r.args)
            );
            return (
              <React.Fragment key={i}>
                <Text bold>{"  "}Part {i + 1}: {part.title || "Untitled"}</Text>
                {part.description ? <Text>{"    "}{part.description}</Text> : null}
                {examples.length > 0 ? (
                  <>
                    <Text dimColor>{"    "}Examples:</Text>
                    {examples.map((ex, j) => {
                      const argsStr = ex.args.map((a) => JSON.stringify(a)).join(", ");
                      return (
                        <Text key={j} dimColor>{"      "}{ex.function}({argsStr}){"   "}{"\u2014"} {ex.label}</Text>
                      );
                    })}
                  </>
                ) : null}
                <Text>{""}</Text>
              </React.Fragment>
            );
          })}
        </>
      ) : null}

      <Text color="gray">{"  "}[Press any key to go back]</Text>
    </>
  );
}
