#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
NODE_ENV=production yarn tsx runner/index.js
