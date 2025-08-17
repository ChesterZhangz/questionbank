#!/bin/bash

# 修复 API 域名解析问题的脚本
# 作者: Claude
# 日期: 2025-08-17

echo "开始修复 API 域名解析问题..."

# 1. 确保 Nginx 容器中有正确的 hosts 配置
echo "步骤 1: 配置 Nginx 容器的 hosts 文件..."
sudo docker exec mareate-nginx sh -c 'echo "127.0.0.1 api" >> /etc/hosts'
echo "✓ Nginx 容器 hosts 文件已更新"

# 2. 确保 Nginx 配置正确处理 api 主机名
echo "步骤 2: 检查 Nginx 配置..."
if grep -q "server_name api" /root/questionbank/nginx.conf; then
  echo "✓ Nginx 配置中已存在 api 主机名处理"
else
  echo "添加 api 主机名处理到 Nginx 配置..."
  # 在这里可以添加更新 nginx.conf 的代码
fi

# 3. 重启 Nginx 容器以应用更改
echo "步骤 3: 重启 Nginx 容器..."
sudo docker restart mareate-nginx
echo "✓ Nginx 容器已重启"

# 4. 检查 DNS 解析
echo "步骤 4: 测试 API 域名解析..."
if sudo docker exec mareate-nginx ping -c 1 api > /dev/null 2>&1; then
  echo "✓ API 域名解析正常"
else
  echo "✗ API 域名解析失败，请检查配置"
fi

echo "修复完成！请测试登录功能。"
