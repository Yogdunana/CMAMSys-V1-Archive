#!/bin/bash
# Test Dockerfile changes locally

echo "=== Testing Dockerfile changes ==="

# Set test environment variables
export DATABASE_URL="postgresql://test:test@localhost:5432/test_cmamsys"

# Test Stage 1: Dependencies
echo ""
echo "Testing Stage 1: Dependencies installation..."
docker build --target deps \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  -t cmamsys-deps:test \
  .

if [ $? -ne 0 ]; then
  echo "❌ Stage 1 failed!"
  exit 1
fi

echo "✅ Stage 1 succeeded!"

# Test Stage 2: Builder
echo ""
echo "Testing Stage 2: Builder..."
docker build --target builder \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  -t cmamsys-builder:test \
  .

if [ $? -ne 0 ]; then
  echo "❌ Stage 2 failed!"
  exit 1
fi

echo "✅ Stage 2 succeeded!"

# Test full build
echo ""
echo "Testing full Docker image build..."
docker build \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  -t cmamsys:test \
  .

if [ $? -ne 0 ]; then
  echo "❌ Full build failed!"
  exit 1
fi

echo "✅ Full build succeeded!"

# Cleanup
echo ""
echo "Cleaning up test images..."
docker rmi cmamsys-deps:test cmamsys-builder:test cmamsys:test

echo ""
echo "=== All tests passed! ==="
