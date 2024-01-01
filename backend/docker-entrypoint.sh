#!/bin/bash
set -e

echo "Starting the application in ${ENVIRONMENT} mode..."

cd /app
if [ -x ./main ]; then
  ls -la ./main
  exec ./main "$@"
else
  echo "Error: 'main' executable not found."
  exit 1
fi