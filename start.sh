#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
yarn node runner/index.js
