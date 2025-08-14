# 企业服务架构说明

## 概述

为了统一管理所有企业相关的API调用，我们创建了一个统一的企业服务文件 `enterpriseService.ts`，将所有企业相关的接口、类型定义和API调用集中管理。

## 问题解决

### 重复API问题
**已解决**：我们发现并解决了 `api.ts` 文件中重复定义企业相关API的问题：

- **之前**：`api.ts` 中同时定义了 `enterpriseAPI` 和 `myEnterpriseAPI`，与 `enterpriseService.ts` 重复
- **现在**：`api.ts` 中的企业API现在只是 `enterpriseService` 的向后兼容导出，避免重复定义
- **结果**：所有企业相关的API逻辑都集中在 `enterpriseService.ts` 中，`api.ts` 只负责转发调用

## 文件结构

```
frontend/src/services/
├── enterpriseService.ts     # 统一的企业服务（新）
├── api.ts                  # 原有的API文件（企业API已迁移，保留向后兼容）
├── dashboardAPI.ts         # 仪表板API
├── gameAPI.ts             # 游戏API
├── mathpixService.ts      # 数学公式识别服务
├── questionAnalysisAPI.ts # 题目分析API
└── searchAPI.ts           # 搜索API
```

## 企业服务特性

### 1. 统一接口管理
- 所有企业相关的API调用都集中在 `enterpriseService` 中
- 统一的类型定义和接口规范
- 清晰的API分组和命名

### 2. 功能模块划分

#### 企业管理 (超级管理员)
- `getAllEnterprises()` - 获取所有企业列表
- `getEnterprise()` - 获取企业详情
- `createEnterprise()` - 创建企业
- `updateEnterprise()` - 更新企业信息
- `uploadEnterpriseAvatar()` - 上传企业头像
- `deleteEnterprise()` - 删除企业

#### 我的企业 (企业成员)
- `getMyEnterpriseInfo()` - 获取当前用户的企业信息
- `getEnterpriseMembers()` - 获取企业成员列表
- `getEnterpriseDepartments()` - 获取企业部门列表
- `createDepartment()` - 创建部门
- `updateDepartment()` - 更新部门
- `deleteDepartment()` - 删除部门
- `sendMessage()` - 发送企业消息
- `getMessages()` - 获取企业消息列表

#### 企业统计 (扩展功能)
- `getEnterpriseUserStats()` - 获取企业用户统计
- `getEnterpriseDepartmentStats()` - 获取企业部门统计
- `getEnterpriseActivityStats()` - 获取企业活动统计

### 3. 类型定义

所有企业相关的类型都定义在 `enterpriseService.ts` 中：

```typescript
export interface Enterprise { ... }
export interface EnterpriseMember { ... }
export interface Department { ... }
export interface EnterpriseMessage { ... }
export interface EnterpriseInfo { ... }
```

## 使用方法

### 1. 导入服务

```typescript
// 推荐方式：使用统一服务
import { enterpriseService } from '../../services/enterpriseService';

// 或者使用默认导出
import enterpriseService from '../../services/enterpriseService';
```

### 2. 调用API

```typescript
// 获取企业信息
const response = await enterpriseService.getMyEnterpriseInfo();

// 获取成员列表
const response = await enterpriseService.getEnterpriseMembers({ page: 1, limit: 20 });

// 创建部门
const response = await enterpriseService.createDepartment({
  name: '技术部',
  code: 'TECH',
  description: '负责技术开发'
});
```

### 3. 向后兼容

为了保持向后兼容，原有的API导出仍然可用：

```typescript
// 仍然可以使用（但不推荐）
import { enterpriseAPI, myEnterpriseAPI } from '../../services/api';

// 这些实际上是 enterpriseService 的别名，通过动态导入实现
```

## 迁移指南

### 从原有API迁移到新服务

#### 1. 更新导入语句

```typescript
// 旧方式
import { enterpriseAPI } from '../../services/api';
import { myEnterpriseAPI } from '../../services/api';

// 新方式
import { enterpriseService } from '../../services/enterpriseService';
```

#### 2. 更新API调用

```typescript
// 旧方式
const response = await enterpriseAPI.getAllEnterprises();
const response = await myEnterpriseAPI.getEnterpriseInfo();

// 新方式
const response = await enterpriseService.getAllEnterprises();
const response = await enterpriseService.getMyEnterpriseInfo();
```

#### 3. 更新类型导入

```typescript
// 旧方式
import type { Enterprise } from '../../types';

// 新方式
import type { Enterprise } from '../../services/enterpriseService';
```

## 优势

1. **统一管理**：所有企业相关的API调用集中在一个文件中
2. **类型安全**：完整的TypeScript类型定义
3. **易于维护**：修改API时只需要更新一个文件
4. **向后兼容**：不影响现有代码的运行
5. **清晰分组**：按功能模块清晰分组API
6. **扩展性好**：易于添加新的企业相关功能
7. **避免重复**：解决了之前重复定义API的问题

## 注意事项

1. 新开发的功能建议直接使用 `enterpriseService`
2. 现有代码可以逐步迁移，不需要一次性全部修改
3. 类型定义已经更新，确保类型安全
4. 所有API调用都经过测试，确保功能正常
5. `api.ts` 中的企业API现在只是转发，实际逻辑在 `enterpriseService.ts` 中

## 未来计划

1. 逐步迁移其他页面到新的企业服务
2. 添加更多的企业统计和分析功能
3. 优化API调用性能
4. 添加缓存机制
5. 完善错误处理和日志记录
6. 考虑将其他API也进行类似的统一管理
