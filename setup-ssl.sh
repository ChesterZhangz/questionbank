#!/bin/bash

# SSL证书设置脚本
echo "🔐 SSL证书设置脚本"
echo "=================="

# 创建SSL目录
echo "📁 创建SSL目录..."
sudo mkdir -p /etc/nginx/ssl
sudo chown -R ubuntu:ubuntu /etc/nginx/ssl
sudo chmod 700 /etc/nginx/ssl

# 检查证书文件
echo "🔍 检查证书文件..."
if [ -f ~/ssl/cert.pem ] && [ -f ~/ssl/key.pem ]; then
    echo "✅ 找到证书文件"
    
    # 复制证书文件到nginx目录
    echo "📋 复制证书文件..."
    sudo cp ~/ssl/cert.pem /etc/nginx/ssl/
    sudo cp ~/ssl/key.pem /etc/nginx/ssl/
    
    # 设置权限
    echo "🔒 设置文件权限..."
    sudo chown root:root /etc/nginx/ssl/*
    sudo chmod 600 /etc/nginx/ssl/*
    
    echo "✅ SSL证书设置完成！"
    echo "📝 现在可以重启nginx服务了"
else
    echo "❌ 未找到证书文件"
    echo "请确保以下文件存在于 ~/ssl/ 目录："
    echo "  - cert.pem (证书文件)"
    echo "  - key.pem (私钥文件)"
    echo ""
    echo "请先下载证书文件并上传到服务器"
fi

echo ""
echo "🚀 下一步："
echo "1. 重启nginx服务: docker-compose restart nginx"
echo "2. 测试HTTPS访问: https://mareate.com"
echo "3. 检查SSL配置: docker-compose logs nginx"
