# Mareate 内部题库系统

一个现代化的教育题库管理系统，支持多种题型、智能文档解析、AI辅助功能等。

## 技术栈

### 前端
- React 19 + TypeScript
- Vite + Tailwind CSS
- React Query + Zustand
- KaTeX (数学公式)
- PDF.js + Mammoth (文档处理)

### 后端
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT 认证
- 腾讯云 OCR + DeepSeek AI
- Docker 容器化

## 功能特性

- 🔐 用户认证与权限管理
- 📚 题库创建与管理
- 📝 多种题型支持（选择、填空、解答等）
- 📄 智能文档解析（PDF、Word）
- 🤖 AI 辅助功能
- 🔍 高级搜索与筛选
- 📊 数据统计与分析
- 📱 响应式设计

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone <your-gitee-repo-url>
cd mareate-question-bank
```

2. 安装所有依赖
```bash
# 安装根目录依赖（包含 concurrently）
npm install

# 安装前端和后端依赖
npm run install:all
```

3. 配置环境变量
```bash
# 复制环境配置文件
cp env.example .env
# 编辑 .env 文件，配置数据库、API密钥等
```

4. 启动开发服务器（推荐方式）
```bash
# 同时启动前端和后端
npm run dev
```

或者分别启动：
```bash
# 启动后端（端口 3001）
npm run dev:backend

# 启动前端（端口 5173，新终端）
npm run dev:frontend
```

5. 访问应用
- 前端：http://localhost:5173
- 后端API：http://localhost:3001
- 健康检查：http://localhost:3001/health

### 开发环境特性
- 🔄 热重载：前端和后端都支持热重载
- 🌐 API代理：前端自动代理 `/api` 请求到后端
- 🔧 开发工具：完整的开发工具链支持
- 📝 类型检查：TypeScript 类型检查

### 生产部署

#### 方法一：使用 Gitee Actions 自动部署（推荐）

1. **设置 Gitee 仓库**
   - 在 Gitee 创建新仓库
   - 推送代码到仓库

2. **配置 Gitee Secrets**
   在 Gitee 仓库设置中添加以下 Secrets：
   - `SERVER_HOST`: 服务器IP (43.160.253.32)
   - `SERVER_USER`: 服务器用户名 (ubuntu)
   - `SERVER_SSH_KEY`: 服务器SSH私钥

3. **自动部署**
   - 推送代码到 `main` 或 `master` 分支
   - Gitee Actions 会自动构建并部署到服务器

#### 方法二：手动部署

1. **准备服务器环境**
```bash
# 在服务器上运行
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **部署应用**
```bash
# 克隆项目到服务器
git clone <your-gitee-repo-url>
cd mareate-question-bank

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

## 项目结构

```
mareate-question-bank/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── stores/         # 状态管理
│   │   └── types/          # TypeScript类型
│   └── package.json
├── backend/                 # 后端应用
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── middleware/     # 中间件
│   └── package.json
├── Dockerfile              # Docker配置
├── docker-compose.yml      # 容器编排
├── nginx.conf             # Nginx配置
├── deploy.sh              # 部署脚本
└── README.md
```

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# 服务器配置
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://43.160.253.32

# 数据库配置
MONGODB_URI=mongodb+srv://...

# JWT配置
JWT_SECRET=your-secret-key

# 腾讯云配置
TENCENT_CLOUD_SECRET_ID=your-secret-id
TENCENT_CLOUD_SECRET_KEY=your-secret-key

# DeepSeek AI配置
DEEPSEEK_API_KEY=your-api-key

# 邮件配置
EMAIL_HOST=smtp.qq.com
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/verify-email` - 邮箱验证

### 题库管理
- `GET /api/question-banks` - 获取题库列表
- `POST /api/question-banks` - 创建题库
- `PUT /api/question-banks/:id` - 更新题库
- `DELETE /api/question-banks/:id` - 删除题库

### 题目管理
- `GET /api/questions` - 获取题目列表
- `POST /api/questions` - 创建题目
- `PUT /api/questions/:id` - 更新题目
- `DELETE /api/questions/:id` - 删除题目

### 文档处理
- `POST /api/ocr/upload` - 上传文档进行OCR
- `POST /api/document-parser/parse` - 解析文档
- `POST /api/ai-optimization/optimize` - AI优化

## 部署地址

- **生产环境**: http://43.160.253.32
- **API文档**: http://43.160.253.32/api
- **健康检查**: http://43.160.253.32/health

## 开发团队

- **Viquard Team** - 核心开发团队
- **Chester ZHANG** - 项目负责人

## 许可证

ISC License

## 支持与反馈

如有问题或建议，请通过以下方式联系：

1. 在 Gitee 仓库提交 Issue
2. 发送邮件至 admin@viquard.com
3. 查看部署文档 `DEPLOYMENT.md`

## 更新日志

### v1.0.0 (2024-08-03)
- 🎉 初始版本发布
- ✨ 完整的题库管理功能
- 🤖 AI 辅助功能集成
- 📱 响应式设计
- 🐳 Docker 容器化部署 