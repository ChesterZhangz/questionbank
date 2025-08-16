#!/bin/bash

# SSL证书设置脚本 - root用户版本
echo "🔐 SSL证书设置脚本 (root用户版本)"
echo "=================================="

# 检查是否以root用户运行
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请以root用户运行此脚本"
    echo "使用: sudo su - 切换到root用户"
    exit 1
fi

# 创建SSL目录
echo "📁 创建SSL目录..."
mkdir -p /root/ssl
chmod 700 /root/ssl

# 检查证书文件
echo "🔍 检查证书文件..."
if [ -f /root/ssl/cert.pem ] && [ -f /root/ssl/key.pem ]; then
    echo "✅ 找到证书文件"
    
    # 设置权限
    echo "🔒 设置文件权限..."
    chown root:root /root/ssl/*
    chmod 600 /root/ssl/*
    
    echo "✅ SSL证书设置完成！"
    echo "📝 现在可以重启nginx服务了"
else
    echo "❌ 未找到证书文件"
    echo "请确保以下文件存在于 /root/ssl/ 目录："
    echo "  - cert.pem (证书文件)"
    echo "  - key.pem (私钥文件)"
    echo ""
    echo "如果证书在ubuntu用户目录，请执行："
    echo "  cp /home/ubuntu/ssl/cert.pem /root/ssl/"
    echo "  cp /home/ubuntu/ssl/key.pem /root/ssl/"
fi

echo ""
echo "🚀 下一步："
echo "1. 重启nginx服务: docker-compose restart nginx"
echo "2. 测试HTTPS访问: https://mareate.com"
echo "3. 检查SSL配置: docker-compose logs nginx"
