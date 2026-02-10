#!/bin/bash

# Redis Service Management Script
# Redis 服务管理脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Redis 配置
REDIS_PORT=6379
REDIS_HOST="localhost"
REDIS_CONFIG="config/redis.conf"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CMAMSys Redis 服务管理${NC}"
echo -e "${GREEN}========================================${NC}\n"

# 检查 Redis 是否已安装
if ! command -v redis-server &> /dev/null; then
    echo -e "${RED}错误: Redis 未安装${NC}"
    echo -e "${YELLOW}请先安装 Redis:${NC}"
    echo -e "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo -e "  macOS: brew install redis"
    echo -e "  Windows: 从 https://redis.io/download 下载"
    exit 1
fi

echo -e "${GREEN}✓ Redis 已安装: $(redis-server --version)${NC}\n"

# 检查 Redis 是否运行
check_redis() {
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 启动 Redis
start_redis() {
    echo -e "${YELLOW}正在启动 Redis...${NC}"

    if [ -f "$REDIS_CONFIG" ]; then
        redis-server "$REDIS_CONFIG" --daemonize yes
    else
        redis-server --daemonize yes
    fi

    # 等待 Redis 启动
    for i in {1..10}; do
        if check_redis; then
            echo -e "${GREEN}✓ Redis 已成功启动${NC}"
            echo -e "${GREEN}  地址: redis://$REDIS_HOST:$REDIS_PORT${NC}"
            return 0
        fi
        sleep 1
    done

    echo -e "${RED}✗ Redis 启动失败${NC}"
    return 1
}

# 停止 Redis
stop_redis() {
    echo -e "${YELLOW}正在停止 Redis...${NC}"
    redis-cli -h $REDIS_HOST -p $REDIS_PORT shutdown
    echo -e "${GREEN}✓ Redis 已停止${NC}"
}

# 重启 Redis
restart_redis() {
    stop_redis
    sleep 2
    start_redis
}

# 查看状态
status_redis() {
    if check_redis; then
        echo -e "${GREEN}✓ Redis 正在运行${NC}"
        echo -e "${GREEN}  地址: redis://$REDIS_HOST:$REDIS_PORT${NC}"

        # 显示详细信息
        echo -e "\n${YELLOW}Redis 信息:${NC}"
        redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO server | grep -E "redis_version|os|process_id"
        redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO memory | grep -E "used_memory_human|maxmemory_human"
    else
        echo -e "${RED}✗ Redis 未运行${NC}"
        return 1
    fi
}

# 测试连接
test_redis() {
    echo -e "${YELLOW}测试 Redis 连接...${NC}"

    if check_redis; then
        # Ping 测试
        PING_RESULT=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT ping)
        echo -e "${GREEN}✓ Ping: $PING_RESULT${NC}"

        # 设置和获取测试
        redis-cli -h $REDIS_HOST -p $REDIS_PORT SET test_key "test_value" > /dev/null
        TEST_VALUE=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT GET test_key)
        echo -e "${GREEN}✓ Set/Get: $TEST_VALUE${NC}"

        # 删除测试键
        redis-cli -h $REDIS_HOST -p $REDIS_PORT DEL test_key > /dev/null

        echo -e "${GREEN}✓ Redis 连接测试成功${NC}"
    else
        echo -e "${RED}✗ Redis 连接测试失败${NC}"
        return 1
    fi
}

# 清空数据
flush_redis() {
    echo -e "${YELLOW}警告: 此操作将清空 Redis 中的所有数据${NC}"
    read -p "确定要继续吗？(yes/no): " CONFIRM

    if [ "$CONFIRM" = "yes" ]; then
        redis-cli -h $REDIS_HOST -p $REDIS_PORT FLUSHALL
        echo -e "${GREEN}✓ Redis 数据已清空${NC}"
    else
        echo -e "${YELLOW}操作已取消${NC}"
    fi
}

# 显示使用帮助
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start    - 启动 Redis 服务"
    echo "  stop     - 停止 Redis 服务"
    echo "  restart  - 重启 Redis 服务"
    echo "  status   - 查看 Redis 状态"
    echo "  test     - 测试 Redis 连接"
    echo "  flush    - 清空 Redis 数据"
    echo "  help     - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 test"
}

# 主逻辑
case "${1:-help}" in
    start)
        start_redis
        ;;
    stop)
        stop_redis
        ;;
    restart)
        restart_redis
        ;;
    status)
        status_redis
        ;;
    test)
        test_redis
        ;;
    flush)
        flush_redis
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}错误: 未知命令 '$1'${NC}"
        show_help
        exit 1
        ;;
esac
