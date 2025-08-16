#!/bin/bash

# 修复混合内容错误的综合脚本
echo "🔧 开始修复混合内容错误..."

# 1. 检查环境变量文件
echo "📋 检查环境变量文件..."
if [ -f ".env" ]; then
  echo "✅ 找到.env文件，检查环境变量配置..."
  
  # 更新FRONTEND_URL
  if grep -q "FRONTEND_URL=" .env; then
    sed -i 's|FRONTEND_URL=http://|FRONTEND_URL=https://|g' .env
    echo "✅ 已更新FRONTEND_URL为HTTPS"
  else
    echo "FRONTEND_URL=https://www.mareate.com" >> .env
    echo "✅ 已添加FRONTEND_URL=https://www.mareate.com"
  fi
  
  # 更新VITE_API_URL
  if grep -q "VITE_API_URL=" .env; then
    sed -i 's|VITE_API_URL=http://|VITE_API_URL=https://|g' .env
    echo "✅ 已更新VITE_API_URL为HTTPS"
  else
    echo "VITE_API_URL=https://www.mareate.com/api" >> .env
    echo "✅ 已添加VITE_API_URL=https://www.mareate.com/api"
  fi
else
  echo "❌ 未找到.env文件，创建新文件..."
  echo "FRONTEND_URL=https://www.mareate.com" > .env
  echo "VITE_API_URL=https://www.mareate.com/api" >> .env
  echo "✅ 已创建.env文件并添加环境变量"
fi

# 2. 检查前端构建文件中的HTTP引用
echo "🔍 检查前端构建文件中的HTTP引用..."
if [ -d "frontend/dist" ]; then
  echo "✅ 找到前端构建目录"
  
  # 查找包含http://api的JavaScript文件
  HTTP_FILES=$(grep -r "http://api" ./frontend/dist --include="*.js" | cut -d: -f1 | sort | uniq)
  
  if [ -z "$HTTP_FILES" ]; then
    echo "✅ 未找到包含http://api的文件"
  else
    echo "🔧 修复以下文件中的http://api引用:"
    for FILE in $HTTP_FILES; do
      echo "   - $FILE"
      # 替换http://api为https://www.mareate.com/api
      sed -i 's|http://api|https://www.mareate.com/api|g' "$FILE"
    done
    echo "✅ 文件修复完成"
  fi
else
  echo "⚠️ 未找到前端构建目录，跳过检查"
fi

# 3. 添加hosts文件映射
echo "📝 添加hosts文件映射..."
if grep -q "api" /etc/hosts; then
  echo "✅ hosts文件已包含api映射，检查是否正确..."
  # 更新现有映射
  sudo sed -i "/api/c\\127.0.0.1 api" /etc/hosts
else
  echo "✅ 添加新的api映射..."
  echo "127.0.0.1 api" | sudo tee -a /etc/hosts
fi

echo "📋 当前hosts文件内容:"
cat /etc/hosts

# 4. 重启服务
echo "🔄 重启服务..."
docker-compose down
docker-compose up -d

# 5. 验证修复
echo "🔍 验证修复..."
sleep 5
echo "测试HTTP到HTTPS重定向:"
curl -I http://api/auth/login

echo "🎉 修复完成！"
echo "⚠️ 注意：如果仍然遇到混合内容错误，请尝试清除浏览器缓存或重新构建前端代码"
