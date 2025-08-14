# 错误页面系统

## 概述

这是一个完整的错误页面系统，包含400、403、404、500等常见HTTP错误页面，每个页面都集成了数学小游戏，让用户在等待时也能享受乐趣。

## 功能特点

### 🎮 数学小游戏
- **数学计算游戏**: 快速计算题，提升数学能力
- **记忆游戏**: 配对相同数字，锻炼记忆力
- **数字拼图**: 滑动拼图，训练逻辑思维

### 🔄 智能导航
- 返回上一页功能
- 返回首页功能
- 刷新页面功能
- 自动错误处理

### 📱 响应式设计
- 完美适配桌面、平板、手机
- 支持深色模式
- 流畅的动画效果

## 文件结构

```
src/pages/errors/
├── ErrorPage.tsx          # 基础错误页面组件
├── 400Page.tsx           # 400错误页面
├── 403Page.tsx           # 403错误页面
├── 404Page.tsx           # 404错误页面
├── 500Page.tsx           # 500错误页面
├── ErrorDemoPage.tsx     # 错误页面演示
├── index.ts              # 导出文件
└── README.md             # 说明文档

src/components/errors/
├── ErrorBoundary.tsx     # React错误边界
└── NetworkErrorHandler.tsx # 网络错误处理

src/utils/
└── errorHandler.ts       # 错误处理工具函数

src/styles/
└── errorPages.css        # 错误页面样式
```

## 使用方法

### 1. 基本使用

```tsx
import { Page404 } from './pages/errors';

// 在路由中使用
<Route path="/error/404" element={<Page404 />} />
```

### 2. 错误边界使用

```tsx
import ErrorBoundary from './components/errors/ErrorBoundary';

// 包装应用
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 3. 网络错误处理

```tsx
import NetworkErrorHandler from './components/errors/NetworkErrorHandler';

// 包装应用
<NetworkErrorHandler>
  <YourApp />
</NetworkErrorHandler>
```

### 4. 错误处理工具

```tsx
import { handleApiError, createError } from './utils/errorHandler';

// 处理API错误
try {
  const response = await api.get('/data');
} catch (error) {
  const appError = handleApiError(error);
  console.error(appError);
}
```

## 游戏说明

### 数学计算游戏
- 随机生成加减乘运算题
- 答对得10分，答错不扣分
- 30秒时间限制
- 支持键盘输入（Enter确认）

### 记忆游戏
- 4x4网格，8对相同数字
- 点击卡片翻转，配对相同数字
- 配对成功得5分
- 30秒时间限制

### 数字拼图
- 3x3网格，滑动拼图
- 将数字按顺序排列
- 完成拼图得20分
- 记录移动步数

## 样式定制

错误页面使用了自定义CSS样式，支持以下定制：

### 颜色主题
```css
/* 修改错误页面背景 */
.error-page-container {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}

/* 修改错误代码颜色 */
.error-code {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

### 动画效果
```css
/* 修改动画时长 */
.error-icon {
  animation: shimmer 3s infinite; /* 修改为3秒 */
}

/* 添加新的动画 */
@keyframes yourAnimation {
  /* 自定义动画 */
}
```

## 测试方法

### 1. 访问演示页面
访问 `/error-demo` 查看所有错误页面的演示。

### 2. 直接访问错误页面
- `/error/400` - 400错误页面
- `/error/403` - 403错误页面
- `/error/404` - 404错误页面
- `/error/500` - 500错误页面

### 3. 触发错误
- 访问不存在的路由会自动显示404页面
- 在组件中抛出错误会触发错误边界
- 网络断开会显示网络错误提示

## 技术实现

### 前端技术栈
- React 18 + TypeScript
- Framer Motion 动画库
- Tailwind CSS 样式框架
- Lucide React 图标库
- React Router 路由管理

### 错误处理机制
- React Error Boundary 错误边界
- 全局错误处理器
- 网络状态监控
- API 错误统一处理
- 错误日志记录

### 性能优化
- 组件懒加载
- 动画性能优化
- 响应式图片
- 代码分割

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 