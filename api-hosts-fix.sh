#!/bin/bash

# 修复混合内容错误的hosts文件配置脚本
echo "🔧 添加hosts文件映射，修复混合内容错误..."

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me)
echo "🌐 服务器IP: $SERVER_IP"

# 添加hosts文件映射
echo "📝 添加hosts文件映射..."
if grep -q "api" /etc/hosts; then
    echo "✅ hosts文件已包含api映射，检查是否正确..."
    # 更新现有映射
    sudo sed -i "/api/c\\$SERVER_IP api" /etc/hosts
else
    echo "✅ 添加新的api映射..."
    echo "$SERVER_IP api" | sudo tee -a /etc/hosts
fi

echo "📋 当前hosts文件内容:"
cat /etc/hosts

echo "🎉 hosts文件配置完成！"
echo "⚠️  注意：此修复仅对服务器端有效，客户端浏览器仍可能遇到混合内容错误"
echo "💡 建议：同时修复前端代码，确保所有API请求使用HTTPS"
