#!/bin/bash

# Mareate题库系统部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 Mareate 题库系统..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境文件
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件，请确保环境配置文件存在"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down --remove-orphans

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker system prune -f

# 构建新镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 检查健康状态
echo "🏥 检查健康状态..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ 服务健康检查通过"
else
    echo "⚠️  服务健康检查失败，请检查日志"
    docker-compose logs --tail=50
fi

echo "🎉 部署完成！"
echo "📱 前端地址: http://43.160.253.32"
echo "🔧 API地址: http://43.160.253.32/api"
echo "📋 查看日志: docker-compose logs -f" 