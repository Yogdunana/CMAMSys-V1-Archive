#!/bin/bash

# CMAMSys Docker Build Script
# Supports building Community and Enterprise editions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EDITION="${1:-community}"
IMAGE_NAME="cmamsys"
IMAGE_TAG="${2:-latest}"
REGISTRY="${REGISTRY:-}"
DOCKERFILE="docker/Dockerfile.${EDITION}"

# Print banner
print_banner() {
  echo -e "${BLUE}"
  echo "========================================"
  echo "   CMAMSys Docker Build Script"
  echo "========================================"
  echo -e "${NC}"
}

# Print usage
print_usage() {
  echo "Usage: $0 <edition> [tag] [options]"
  echo ""
  echo "Editions:"
  echo "  community  Build Community Edition (default)"
  echo "  enterprise Build Enterprise Edition"
  echo ""
  echo "Arguments:"
  echo "  tag        Image tag (default: latest)"
  echo ""
  echo "Options:"
  echo "  --push     Push to registry after build"
  echo "  --no-cache Build without cache"
  echo ""
  echo "Examples:"
  echo "  $0 community v1.0.0"
  echo "  $0 enterprise v1.0.0 --push"
  echo "  $0 community latest --no-cache"
  echo ""
}

# Parse arguments
PUSH=false
NO_CACHE=""
shift 2
while [[ $# -gt 0 ]]; do
  case $1 in
    --push)
      PUSH=true
      shift
      ;;
    --no-cache)
      NO_CACHE="--no-cache"
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      print_usage
      exit 1
      ;;
  esac
done

# Validate edition
if [[ "$EDITION" != "community" && "$EDITION" != "enterprise" ]]; then
  echo -e "${RED}Invalid edition: $EDITION${NC}"
  echo "Valid editions: community, enterprise"
  print_usage
  exit 1
fi

# Check if Dockerfile exists
if [[ ! -f "$DOCKERFILE" ]]; then
  echo -e "${RED}Dockerfile not found: $DOCKERFILE${NC}"
  exit 1
fi

# Build image name
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}-${EDITION}"

# Start build
print_banner
echo -e "${YELLOW}Building CMAMSys ${EDITION^} Edition${NC}"
echo -e "${BLUE}Image: ${FULL_IMAGE_NAME}${NC}"
echo -e "${BLUE}Dockerfile: ${DOCKERFILE}${NC}"
echo ""

# Build arguments
BUILD_ARGS=(
  --build-arg NODE_VERSION=24
  --build-arg NEXT_VERSION=16.1.1
)

# Add no-cache if specified
if [[ -n "$NO_CACHE" ]]; then
  BUILD_ARGS+=($NO_CACHE)
fi

# Build command
echo -e "${GREEN}Building image...${NC}"
docker build "${BUILD_ARGS[@]}" -t "$FULL_IMAGE_NAME" -f "$DOCKERFILE" .

if [[ $? -ne 0 ]]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build successful!${NC}"
echo -e "${BLUE}Image: ${FULL_IMAGE_NAME}${NC}"
echo ""

# Tag latest
docker tag "$FULL_IMAGE_NAME" "${IMAGE_NAME}:${EDITION}"
echo -e "${BLUE}Tagged as: ${IMAGE_NAME}:${EDITION}${NC}"
echo ""

# Push to registry if specified
if [[ "$PUSH" == true ]]; then
  if [[ -z "$REGISTRY" ]]; then
    echo -e "${YELLOW}Warning: REGISTRY environment variable not set${NC}"
    echo -e "Set REGISTRY to push to remote registry, e.g.:"
    echo -e "  export REGISTRY=registry.example.com"
    echo ""
  else
    PUSH_IMAGE="${REGISTRY}/${FULL_IMAGE_NAME}"
    echo -e "${GREEN}Pushing to registry...${NC}"
    docker tag "$FULL_IMAGE_NAME" "$PUSH_IMAGE"
    docker push "$PUSH_IMAGE"
    echo -e "${GREEN}✓ Pushed to: ${PUSH_IMAGE}${NC}"
  fi
fi

# Print size
echo ""
echo -e "${BLUE}Image size:${NC}"
docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo -e "${GREEN}✓ All done!${NC}"
