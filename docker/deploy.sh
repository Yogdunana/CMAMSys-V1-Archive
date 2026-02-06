#!/bin/bash

# CMAMSys Deployment Script
# This script automates the deployment of CMAMSys to a Linux server or NAS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="cmamsys"
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="/tmp/cmamsys-backup"
LOG_FILE="/var/log/cmamsys-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✓ $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠ $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✗ $1" | tee -a "$LOG_FILE"
}

check_requirements() {
    log "Checking system requirements..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker found: $(docker --version)"

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_success "Docker Compose found: $(docker-compose --version)"

    # Check if .env file exists
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_warning "Please edit .env file with your configuration before continuing."
        read -p "Press Enter to continue after editing .env file..."
    fi
    log_success ".env file found"
}

backup_data() {
    log "Creating backup..."
    mkdir -p "$BACKUP_DIR"

    # Backup PostgreSQL data
    if [ -d "docker/postgres_data" ]; then
        cp -r docker/postgres_data "$BACKUP_DIR/"
        log_success "PostgreSQL data backed up"
    fi

    # Backup Redis data
    if [ -d "docker/redis_data" ]; then
        cp -r docker/redis_data "$BACKUP_DIR/"
        log_success "Redis data backed up"
    fi

    # Backup application data
    if [ -d "docker/app_data" ]; then
        cp -r docker/app_data "$BACKUP_DIR/"
        log_success "Application data backed up"
    fi

    log_success "Backup created at $BACKUP_DIR"
}

build_images() {
    log "Building Docker images..."
    cd docker
    docker-compose build --no-cache
    cd ..
    log_success "Docker images built successfully"
}

stop_services() {
    log "Stopping existing services..."
    cd docker
    docker-compose down
    cd ..
    log_success "Services stopped"
}

start_services() {
    log "Starting services..."
    cd docker
    docker-compose up -d
    cd ..
    log_success "Services started"
}

wait_for_services() {
    log "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:5000/api/health &> /dev/null; then
            log_success "All services are healthy!"
            return 0
        fi
        attempt=$((attempt + 1))
        log "Attempt $attempt/$max_attempts: Waiting for services..."
        sleep 5
    done

    log_error "Services failed to start within expected time"
    return 1
}

run_migrations() {
    log "Running database migrations..."
    cd docker
    docker-compose exec app npx prisma migrate deploy
    cd ..
    log_success "Database migrations completed"
}

cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    log_success "Cleanup completed"
}

show_status() {
    log "Service status:"
    cd docker
    docker-compose ps
    cd ..
}

show_logs() {
    log "Recent logs:"
    cd docker
    docker-compose logs --tail=50 app
    cd ..
}

# Main deployment flow
main() {
    log "Starting CMAMSys deployment..."

    check_requirements
    backup_data
    stop_services
    build_images
    start_services
    wait_for_services
    run_migrations
    cleanup
    show_status

    log_success "CMAMSys deployed successfully!"
    echo ""
    log "Access your application at: http://localhost:5000"
    log "For logs, run: cd docker && docker-compose logs -f"
    log "To stop services, run: cd docker && docker-compose down"
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    start)
        check_requirements
        start_services
        wait_for_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        check_requirements
        stop_services
        start_services
        wait_for_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_data
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|logs|status|backup}"
        exit 1
        ;;
esac
