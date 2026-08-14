#!/usr/bin/env bash
set -euo pipefail
npm run security:scan
npm run validate:data
npm test
npm run typecheck
npm run lint
npm run build
npm run security:scan:build
echo "SNS-HUB local CI passed"
