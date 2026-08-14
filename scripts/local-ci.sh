#!/usr/bin/env bash
set -euo pipefail
npm run validate:data
npm test
npm run typecheck
npm run lint
npm run build
echo "SNS-HUB local CI passed"
