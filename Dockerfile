# 多阶段构建 - 前端构建阶段
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci

# 复制前端源代码
COPY frontend/ ./

# 构建前端
ENV VITE_API_URL=https://www.mareate.com/api
ENV VITE_BASE_URL=/
RUN npm run build

# 后端构建阶段
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# 复制后端依赖文件
COPY backend/package*.json ./

# 安装后端依赖
RUN npm ci

# 复制后端源代码
COPY backend/ ./

# 确保public目录存在
RUN mkdir -p public/avatars

# 构建后端
ENV FRONTEND_URL=https://www.mareate.com
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装必要的系统依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# 设置环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 创建应用目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制后端构建结果
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/package*.json ./backend/
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules

# 复制静态文件目录
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/public ./backend/public

# 复制前端构建结果
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist
# 复制静态文件到nginx可访问的位置
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/public ./static
# 为nginx准备静态文件
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./nginx-static

# 复制环境配置文件
COPY .env ./

# 创建必要的目录
RUN mkdir -p uploads temp/images && \
    chown -R nextjs:nodejs uploads temp

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3001

# 设置工作目录
WORKDIR /app/backend

# 启动命令
CMD ["node", "dist/index.js"] 