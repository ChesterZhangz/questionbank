#!/bin/bash

# Mareate 题库系统更新脚本
# 使用方法: ./update.sh

set -e

echo "🔄 开始更新 Mareate 题库系统..."

# 检查是否在正确的目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 状态
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是 Git 仓库"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin master

# 检查是否有更新
if [ $? -eq 0 ]; then
    echo "✅ 代码更新成功"
else
    echo "⚠️  代码更新失败，继续使用当前版本"
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker system prune -f

# 重新构建镜像
echo "🔨 重新构建镜像..."
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

echo "🎉 更新完成！"
echo "📱 前端地址: http://43.160.253.32"
echo "🔧 API地址: http://43.160.253.32/api"
echo "📋 查看日志: docker-compose logs -f" 