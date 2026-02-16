#!/bin/bash

# CMAMSys Docker 部署脚本
# 用于快速启动和管理 Docker 部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印彩色消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 函数：生成随机密钥
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# 主函数
main() {
    print_info "CMAMSys Docker 部署脚本"
    echo ""

    # 检查 Docker 和 Docker Compose
    if ! command_exists docker; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    # 检查环境变量文件
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在，从 .env.docker.example 创建"
        cp .env.docker.example .env

        # 生成随机密钥
        print_info "生成随机安全密钥..."
        JWT_SECRET=$(generate_secret)
        REFRESH_TOKEN_SECRET=$(generate_secret)
        ENCRYPTION_KEY=$(generate_secret)
        CSRF_SECRET=$(generate_secret)
        SESSION_SECRET=$(generate_secret)

        # 更新 .env 文件
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
        sed -i.bak "s/REFRESH_TOKEN_SECRET=.*/REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}/" .env
        sed -i.bak "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=${ENCRYPTION_KEY}/" .env
        sed -i.bak "s/CSRF_SECRET=.*/CSRF_SECRET=${CSRF_SECRET}/" .env
        sed -i.bak "s/SESSION_SECRET=.*/SESSION_SECRET=${SESSION_SECRET}/" .env
        rm -f .env.bak

        print_success "已创建 .env 文件并生成随机密钥"
        print_warning "请根据需要修改 .env 文件中的配置"
    fi

    # 读取命令参数
    COMMAND=${1:-help}

    case $COMMAND in
        start|up)
            print_info "启动 CMAMSys 服务..."
            docker compose up -d
            print_success "CMAMSys 服务已启动"
            print_info "访问地址: http://localhost:5000"
            ;;

        stop|down)
            print_info "停止 CMAMSys 服务..."
            docker compose down
            print_success "CMAMSys 服务已停止"
            ;;

        restart)
            print_info "重启 CMAMSys 服务..."
            docker compose restart
            print_success "CMAMSys 服务已重启"
            ;;

        logs)
            print_info "查看日志..."
            docker compose logs -f ${2:-}
            ;;

        build)
            print_info "构建 Docker 镜像..."
            docker compose build
            print_success "Docker 镜像构建完成"
            ;;

        reinstall)
            print_warning "这将删除所有数据，是否继续？(y/n)"
            read -r response
            if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
                print_info "停止并删除容器..."
                docker compose down -v
                print_info "删除镜像..."
                docker compose rmi -f
                print_info "重新构建并启动..."
                docker compose up -d --build
                print_success "CMAMSys 已重新安装"
            else
                print_info "已取消重新安装"
            fi
            ;;

        migrate)
            print_info "运行数据库迁移..."
            docker compose exec app npx prisma migrate deploy
            print_success "数据库迁移完成"
            ;;

        seed)
            print_info "创建管理员账户..."
            docker compose exec app node scripts/create-admin.js
            print_success "管理员账户创建完成"
            ;;

        shell)
            print_info "进入应用容器..."
            docker compose exec app sh
            ;;

        db-shell)
            print_info "进入数据库容器..."
            docker compose exec postgres psql -U postgres -d cmamsys
            ;;

        status)
            print_info "查看服务状态..."
            docker compose ps
            ;;

        health)
            print_info "检查服务健康状态..."
            docker compose exec app wget -q -O- http://localhost:5000/api/health || echo "健康检查失败"
            ;;

        backup)
            print_info "备份数据库..."
            BACKUP_DIR="./backups"
            mkdir -p $BACKUP_DIR
            BACKUP_FILE="$BACKUP_DIR/cmamsys_$(date +%Y%m%d_%H%M%S).sql"
            docker compose exec -T postgres pg_dump -U postgres cmamsys > $BACKUP_FILE
            print_success "数据库备份完成: $BACKUP_FILE"
            ;;

        restore)
            if [ -z "$2" ]; then
                print_error "请指定备份文件路径"
                exit 1
            fi
            print_info "恢复数据库..."
            docker compose exec -T postgres psql -U postgres cmamsys < "$2"
            print_success "数据库恢复完成"
            ;;

        clean)
            print_warning "清理未使用的 Docker 资源..."
            docker system prune -f
            print_success "清理完成"
            ;;

        help|*)
            echo "CMAMSys Docker 部署脚本"
            echo ""
            echo "用法: ./docker-deploy.sh [命令]"
            echo ""
            echo "命令:"
            echo "  start, up        启动服务"
            echo "  stop, down       停止服务"
            echo "  restart          重启服务"
            echo "  logs [service]   查看日志"
            echo "  build            构建镜像"
            echo "  reinstall        重新安装（删除所有数据）"
            echo "  migrate          运行数据库迁移"
            echo "  seed             创建管理员账户"
            echo "  shell            进入应用容器"
            echo "  db-shell         进入数据库容器"
            echo "  status           查看服务状态"
            echo "  health           检查服务健康状态"
            echo "  backup           备份数据库"
            echo "  restore <file>   恢复数据库"
            echo "  clean            清理未使用的 Docker 资源"
            echo "  help             显示帮助信息"
            ;;
    esac
}

# 执行主函数
main "$@"
