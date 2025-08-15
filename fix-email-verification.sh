#!/bin/bash

echo "🔧 修复邮箱验证问题脚本"
echo "=========================="

# 检查是否在服务器上运行
if [ "$(hostname)" != "mareate-server" ]; then
    echo "⚠️  此脚本应在服务器上运行"
    echo "   当前主机名: $(hostname)"
    exit 1
fi

echo "✅ 确认在服务器上运行"

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 检查.env文件
echo "📋 检查环境变量配置..."
if [ -f ".env" ]; then
    echo "✅ .env文件存在"
    echo "📄 .env文件内容预览:"
    grep -E "^(FRONTEND_URL|NODE_ENV|PORT)" .env | head -10
else
    echo "❌ .env文件不存在，创建默认配置..."
    cat > .env << EOF
# 服务器配置
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://43.160.253.32

# JWT配置
JWT_SECRET=2025ViquardChesterZHANG
JWT_REFRESH_SECRET=2025ViquardChesterZHANG

# MongoDB Atlas配置
MONGODB_URI=mongodb+srv://admin:AhQ1oaI6QTmZdfAc@questionbank.ulkbhmd.mongodb.net/mareate?retryWrites=true&w=majority&appName=questionbank

# QQ邮箱配置
QQ_EMAIL_USER=admin@viquard.com
QQ_EMAIL_PASS=dexfjbcppC6CkvLL

# 其他配置...
EOF
    echo "✅ 已创建.env文件"
fi

# 重新构建并启动容器
echo "🔨 重新构建容器..."
docker-compose build --no-cache

echo "🚀 启动容器..."
docker-compose up -d

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 10

# 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 检查环境变量
echo "🔍 检查容器环境变量..."
echo "   检查 FRONTEND_URL 是否正确设置:"
docker exec mareate-app env | grep FRONTEND_URL

# 测试邮箱验证链接
echo "🧪 测试邮箱验证链接..."
echo "   在容器内运行环境变量检查脚本..."

# 创建临时测试脚本
cat > test-env.js << 'EOF'
console.log('🔍 容器内环境变量检查:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);

// 测试邮箱验证链接生成
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const token = 'test-token-123';
const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

console.log('📧 测试邮箱验证链接:');
console.log('  前端URL:', frontendUrl);
console.log('  完整验证链接:', verificationUrl);

// 验证URL格式
try {
    const url = new URL(verificationUrl);
    console.log('✅ URL格式正确:', url.href);
} catch (error) {
    console.log('❌ URL格式错误:', error.message);
}
EOF

# 在容器内运行测试
echo "   运行测试脚本..."
docker exec mareate-app node test-env.js

# 清理临时文件
rm -f test-env.js

echo ""
echo "🎯 修复完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 测试注册新用户，检查邮箱验证链接"
echo "2. 查看容器日志: docker-compose logs -f mareate-app"
echo "3. 如果还有问题，检查防火墙和网络配置"
echo ""
echo "🔍 调试命令:"
echo "   - 查看容器日志: docker-compose logs mareate-app"
echo "   - 进入容器: docker exec -it mareate-app sh"
echo "   - 检查环境变量: docker exec mareate-app env"
echo "   - 重启容器: docker-compose restart mareate-app"
