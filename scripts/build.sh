#!/bin/bash
set -Eeo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install || echo "Warning: pnpm install failed, trying anyway..."

echo "Generating Prisma Client..."
if [ -n "$DATABASE_URL" ]; then
  pnpm prisma generate || echo "Warning: Prisma generate failed, continuing..."
else
  echo "Warning: DATABASE_URL not set, skipping Prisma generate"
fi

echo "Building the project..."
npx next build

echo "Build completed successfully!"
