#!/bin/bash

# CMAMSys Docker Compose Deployment Script
# Supports deploying Community and Enterprise editions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EDITION="${1:-community}"
COMPOSE_FILE="docker/docker-compose.${EDITION}.yml"
ENV_FILE=".env.${EDITION}"

# Print banner
print_banner() {
  echo -e "${BLUE}"
  echo "========================================"
  echo "   CMAMSys Deployment Script"
  echo "========================================"
  echo -e "${NC}"
}

# Print usage
print_usage() {
  echo "Usage: $0 <edition> <action> [options]"
  echo ""
  echo "Editions:"
  echo "  community  Deploy Community Edition (default)"
  echo "  enterprise Deploy Enterprise Edition"
  echo ""
  echo "Actions:"
  echo "  up         Start services"
  echo "  down       Stop and remove services"
  echo "  restart    Restart services"
  echo "  logs       View logs"
  echo "  status     Show service status"
  echo "  build      Build and start services"
  echo "  clean      Remove all volumes and data"
  echo ""
  echo "Options:"
  echo "  --daemon   Run in background (default)"
  echo "  --foreground Run in foreground"
  echo "  --with-redis Include Redis service"
  echo "  --with-minio Include MinIO service (enterprise only)"
  echo "  --with-nginx Include Nginx service (enterprise only)"
  echo ""
  echo "Examples:"
  echo "  $0 community up"
  echo "  $0 enterprise up --with-redis --with-minio"
  echo "  $0 community logs"
  echo "  $0 enterprise clean"
  echo ""
}

# Parse arguments
ACTION="${2:-up}"
DAEMON=true
PROFILES=""
shift 2
while [[ $# -gt 0 ]]; do
  case $1 in
    --daemon)
      DAEMON=true
      shift
      ;;
    --foreground)
      DAEMON=false
      shift
      ;;
    --with-redis)
      PROFILES="--profile with-redis"
      shift
      ;;
    --with-minio)
      if [[ "$EDITION" == "community" ]]; then
        echo -e "${YELLOW}Warning: MinIO is only available in Enterprise Edition${NC}"
      else
        PROFILES="$PROFILES --profile with-minio"
      fi
      shift
      ;;
    --with-nginx)
      if [[ "$EDITION" == "community" ]]; then
        echo -e "${YELLOW}Warning: Nginx is only available in Enterprise Edition${NC}"
      else
        PROFILES="$PROFILES --profile with-nginx"
      fi
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

# Check if compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo -e "${RED}Compose file not found: $COMPOSE_FILE${NC}"
  exit 1
fi

# Create environment file if not exists
if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${YELLOW}Creating environment file: $ENV_FILE${NC}"
  cat > "$ENV_FILE" << EOF
# CMAMSys ${EDITION^} Edition Configuration
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cmamsys

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# MinIO (Enterprise Only)
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=REDACTED_PASSWORD456

# S3 Configuration (Enterprise Only)
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=admin
S3_SECRET_KEY=REDACTED_PASSWORD456
S3_BUCKET=cmamsys-uploads
EOF
  echo -e "${GREEN}✓ Created environment file${NC}"
  echo -e "${YELLOW}Please review and update the values before starting!${NC}"
  echo ""
fi

# Start deployment
print_banner
echo -e "${YELLOW}Deploying CMAMSys ${EDITION^} Edition${NC}"
echo -e "${BLUE}Compose File: ${COMPOSE_FILE}${NC}"
echo -e "${BLUE}Environment: ${ENV_FILE}${NC}"
echo ""

# Docker Compose command
DOCKER_COMPOSE="docker compose -f $COMPOSE_FILE --env-file $ENV_FILE $PROFILES"

# Execute action
case $ACTION in
  up)
    echo -e "${GREEN}Starting services...${NC}"
    if [[ "$DAEMON" == true ]]; then
      $DOCKER_COMPOSE up -d
      echo ""
      echo -e "${GREEN}✓ Services started${NC}"
      echo ""
      echo -e "${BLUE}Access the application at:${NC}"
      echo -e "  ${GREEN}http://localhost:5000${NC}"
      echo ""
      echo -e "${BLUE}View logs:${NC}"
      echo -e "  $0 $EDITION logs"
    else
      $DOCKER_COMPOSE up
    fi
    ;;
  down)
    echo -e "${YELLOW}Stopping services...${NC}"
    $DOCKER_COMPOSE down
    echo -e "${GREEN}✓ Services stopped${NC}"
    ;;
  restart)
    echo -e "${YELLOW}Restarting services...${NC}"
    $DOCKER_COMPOSE restart
    echo -e "${GREEN}✓ Services restarted${NC}"
    ;;
  logs)
    echo -e "${BLUE}Showing logs...${NC}"
    $DOCKER_COMPOSE logs -f --tail=100
    ;;
  status)
    echo -e "${BLUE}Service status:${NC}"
    $DOCKER_COMPOSE ps
    ;;
  build)
    echo -e "${GREEN}Building images...${NC}"
    $DOCKER_COMPOSE build
    echo -e "${GREEN}✓ Build complete${NC}"
    echo ""
    echo -e "${YELLOW}Starting services...${NC}"
    $DOCKER_COMPOSE up -d
    echo -e "${GREEN}✓ Services started${NC}"
    ;;
  clean)
    echo -e "${RED}WARNING: This will remove all data including database!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [[ "$confirm" == "yes" ]]; then
      echo -e "${YELLOW}Stopping and removing services...${NC}"
      $DOCKER_COMPOSE down -v
      echo -e "${GREEN}✓ All data removed${NC}"
    else
      echo -e "${YELLOW}Cancelled${NC}"
    fi
    ;;
  *)
    echo -e "${RED}Unknown action: $ACTION${NC}"
    print_usage
    exit 1
    ;;
esac
