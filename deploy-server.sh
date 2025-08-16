#!/bin/bash

# Mareate题库系统服务器部署脚本
# 使用方法: ./deploy-server.sh

set -e

echo "🚀 开始部署 Mareate 题库系统到服务器..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用root用户运行此脚本${NC}"
    exit 1
fi

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}🌐 服务器IP: $SERVER_IP${NC}"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 安装 Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker 安装完成${NC}"
else
    echo -e "${GREEN}✅ Docker 已安装${NC}"
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}🐙 安装 Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose 安装完成${NC}"
else
    echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
fi

# 更新配置文件中的IP地址
echo -e "${YELLOW}🔧 更新配置文件...${NC}"
if [ -f "nginx.conf" ]; then
    sed -i "s/43.160.253.32/$SERVER_IP/g" nginx.conf
    echo -e "${GREEN}✅ nginx.conf 已更新${NC}"
fi

if [ -f "Dockerfile" ]; then
    sed -i "s/43.160.253.32/$SERVER_IP/g" Dockerfile
    echo -e "${GREEN}✅ Dockerfile 已更新${NC}"
fi

# 创建环境配置文件
echo -e "${YELLOW}📝 创建环境配置文件...${NC}"
cat > .env << EOF
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://$SERVER_IP

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/mareate_db

# 腾讯云配置（请替换为实际值）
TENCENTCLOUD_SECRET_ID=your_secret_id
TENCENTCLOUD_SECRET_KEY=your_secret_key
TENCENTCLOUD_REGION=ap-guangzhou

# DeepSeek AI配置（请替换为实际值）
DEEPSEEK_API_KEY=your_deepseek_api_key

# JWT密钥
JWT_SECRET=mareate_jwt_secret_$(date +%s)

# 邮件配置（可选）
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your_email@qq.com
SMTP_PASS=your_email_password
EOF

echo -e "${GREEN}✅ .env 文件已创建${NC}"

# 创建必要的目录
echo -e "${YELLOW}📁 创建必要目录...${NC}"
mkdir -p uploads temp/images ssl
chmod 755 uploads temp ssl
echo -e "${GREEN}✅ 目录创建完成${NC}"

# 停止现有容器
echo -e "${YELLOW}🛑 停止现有容器...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true

# 清理旧镜像
echo -e "${YELLOW}🧹 清理旧镜像...${NC}"
docker system prune -f

# 构建新镜像
echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
docker-compose build --no-cache

# 启动服务
echo -e "${YELLOW}🚀 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 15

# 检查服务状态
echo -e "${YELLOW}📊 检查服务状态...${NC}"
docker-compose ps

# 检查健康状态
echo -e "${YELLOW}🏥 检查健康状态...${NC}"
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务健康检查通过${NC}"
else
    echo -e "${YELLOW}⚠️  服务健康检查失败，请检查日志${NC}"
    docker-compose logs --tail=50
fi

# 配置防火墙
echo -e "${YELLOW}🔥 配置防火墙...${NC}"
ufw allow 22 2>/dev/null || true
ufw allow 80 2>/dev/null || true
ufw allow 443 2>/dev/null || true
ufw --force enable 2>/dev/null || true

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}📱 前端地址: http://$SERVER_IP${NC}"
echo -e "${GREEN}🔧 API地址: http://$SERVER_IP/api${NC}"
echo -e "${GREEN}📋 查看日志: docker-compose logs -f${NC}"
echo -e "${YELLOW}⚠️  请记得更新 .env 文件中的实际配置值${NC}"
