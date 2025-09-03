# 试卷编辑器API参考文档

## 试卷管理
- POST /api/paper/papers - 创建试卷
- GET /api/paper/papers - 获取试卷列表
- PUT /api/paper/papers/:id - 更新试卷
- DELETE /api/paper/papers/:id - 删除试卷

## 模板管理
- GET /api/paper/templates - 获取模板列表
- POST /api/paper/templates - 创建模板

## 渲染服务
- POST /api/paper/render/latex - LaTeX渲染
- POST /api/paper/render/pdf - PDF生成
