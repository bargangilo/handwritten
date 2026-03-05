import React from "react";
import { Text } from "ink";
import { Select } from "@inkjs/ui";
import { Action } from "../state.js";
import { clearWorkspaceDir } from "../config.js";

export default function ClearConfirm({ dispatch, problem, config, rootDir }) {
  const options = [
    { label: "No", value: "no" },
    { label: "Yes", value: "yes" },
  ];

  return (
    <>
      <Text>{"  "}Clear workspace for "{config.title}"? This cannot be undone.</Text>
      <Select
        options={options}
        onChange={(value) => {
          if (value === "yes") {
            clearWorkspaceDir(problem, rootDir);
          }
          dispatch({ type: Action.CONFIRM_CLEAR });
        }}
      />
    </>
  );
}
