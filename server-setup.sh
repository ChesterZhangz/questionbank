#!/bin/bash

# 服务器环境设置脚本
# 在Ubuntu 22.04服务器上运行

set -e

echo "🔧 开始设置服务器环境..."

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装必要的工具
echo "🛠️  安装必要工具..."
sudo apt install -y curl wget git unzip htop

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo "🐳 安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker 已安装"
fi

# 检查Docker Compose是否已安装
if ! command -v docker-compose &> /dev/null; then
    echo "🐙 安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose 已安装"
fi

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /root/mareate-project
cd /root/mareate-project

# 创建必要的目录
echo "📂 创建必要目录..."
mkdir -p uploads temp/images ssl

# 设置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 显示系统信息
echo "📊 系统信息:"
echo "Docker 版本: $(docker --version)"
echo "Docker Compose 版本: $(docker-compose --version)"
echo "系统内存: $(free -h | grep Mem | awk '{print $2}')"
echo "磁盘空间: $(df -h / | tail -1 | awk '{print $4}') 可用"

echo "✅ 服务器环境设置完成！"
echo "📋 下一步："
echo "1. 上传项目文件到 /root/mareate-project/"
echo "2. 配置 .env 文件"
echo "3. 运行 ./deploy.sh 部署应用" 