import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  CheckCircle,
  Star,
  Palette,
  Shield,
  Zap,
  Bug,
  Sparkles,
  Heart,
  Users,
  Database,
  FileText,
  Upload,
  Settings,
  Moon,
  Bell,
  Info,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';

interface VersionUpdate {
  version: string;
  date: string;
  title: string;
  description: string;
  features: string[];
  improvements: string[];
  fixes: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const versionUpdates: VersionUpdate[] = [
  {
    version: 'v0.74',
    date: '2025-08-25',
    title: 'QuestionView动画系统全面优化：简约破碎感设计、快速响应体验、性能大幅提升',
    description: '全面优化QuestionView组件的动画系统，采用简约破碎感设计理念，大幅提升动画速度，优化用户体验，实现快速响应的界面交互效果.',
    features: [
      'QuestionView动画系统重构：采用简约破碎感设计理念，创造层次分明的视觉体验',
      '超快速动画响应：动画持续时间从0.15s压缩到0.08s，整体速度提升50%',
      '智能延迟系统：微妙的延迟时间设计，创造流畅的破碎感层次效果',
      '统一动画风格：所有元素使用一致的easeOut缓动函数，保持视觉一致性',
      '标签动画优化：题目标签、题目类型、难度等级等元素的快速出现动画',
      '内容区域动画：题目内容、媒体内容、选项等区域的层次化动画效果',
      '侧边栏动画：题目信息、相关题目等侧边元素的快速加载动画',
      '导航元素动画：左右箭头、标签页切换等交互元素的响应式动画',
      'AI题目分析系统：基于DeepSeek API的智能题目评价和核心能力评估',
      '智能分析缓存机制：防止重复分析，提升系统性能和用户体验',
      '核心能力雷达图：六维能力评估（逻辑思维、数学直觉、问题解决、分析技能、创造性思维、计算技能）',
      '自动分析队列管理：智能优先级排序，支持超级管理员强制重新分析',
      '题目整体评价系统：AI生成的综合评分和详细评价理由',
      '权限控制系统：仅超级管理员可强制重新分析，确保系统稳定性',
    ],
    improvements: [
      '动画性能大幅提升：减少GPU负担，优化渲染性能，提升页面流畅度',
      '用户体验显著改善：快速响应的界面反馈，减少等待时间',
      '视觉层次更加清晰：通过动画延迟创造自然的阅读顺序',
      '交互反馈更加及时：按钮悬停、点击等交互的即时动画响应',
      '代码结构更加优化：统一的动画配置，便于维护和扩展',
      '响应式动画支持：在不同设备上保持一致的动画效果',
      'DarkMode动画适配：深色主题下的动画效果完美适配',
      '动画缓存机制：智能缓存动画状态，避免重复计算',
      'AI分析准确性提升：基于大量题目数据的智能学习，生成更精准的评价',
      '分析结果持久化：AI分析结果自动保存到数据库，支持离线查看',
      '智能分析触发：题目创建/修改后自动启动AI分析，无需手动操作',
      '分析状态实时反馈：分析进度、队列状态、错误处理等完整的状态管理',
      '核心能力评估可视化：雷达图展示，直观展示题目的能力培养价值',
    ],
    fixes: [
      '修复动画延迟时间过长问题：从0.4s-0.7s压缩到0.1s-0.4s',
      '解决动画持续时间不一致问题：统一使用0.08s基础时长',
      '修复标签动画间隔过大问题：从0.03s压缩到0.02s',
      '解决选项动画响应慢问题：从0.05s压缩到0.03s',
      '修复侧边栏动画加载慢问题：优化延迟时间配置',
      '解决分析标签页动画卡顿问题：重新设计动画时序',
      '修复底部提示动画延迟过长问题：从0.8s压缩到0.4s',
      '解决"点击查看"动画响应慢问题：优化动画配置',
      '修复题目信息头部动画层次感不足问题：重新设计动画序列',
      '解决媒体内容标题动画延迟问题：优化动画时序安排',
    ],
    icon: Zap,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    version: 'v0.73',
    date: '2025-08-24',
    title: '图片上传持久化系统重构：临时存储转换、QuestionView优化、React渲染稳定性提升',
    description: '重构图片上传持久化系统，实现临时图片到永久存储的自动转换，优化QuestionView中图片与图形的合并显示，修复React key重复导致的渲染问题，全面提升图片管理体验.',
    features: [
      '图片持久化存储系统：临时图片自动转换为永久存储，确保图片URL持久有效',
      'QuestionView媒体内容合并：图片与图形统一显示，提供一致的用户体验',
      '智能图片转换机制：后端自动处理临时图片，使用imageService进行格式转换和存储',
      'React渲染稳定性提升：修复key重复问题，优化组件渲染性能',
      '统一媒体内容展示：图片和图形在同一行显示，支持排序和标签分类',
      '图片管理流程优化：上传→临时存储→题目保存→永久存储→清理临时文件',
      '错误处理机制完善：图片转换失败时的降级处理，不影响题目创建流程',
      '存储空间管理：自动清理临时文件，优化服务器存储资源使用',
    ],
    improvements: [
      '图片显示效果优化：统一的尺寸、样式和交互效果，提升视觉一致性',
      '用户体验提升：图片不再因页面刷新而消失，提供稳定的内容展示',
      '代码结构优化：移除重复的图片和图形显示逻辑，统一使用合并组件',
      '性能优化：减少重复渲染，优化React组件更新机制',
      '响应式设计：图片和图形在不同屏幕尺寸下的完美显示',
      'DarkMode适配：所有新增UI元素完美支持深色主题',
      '交互反馈增强：悬停效果、标签显示、点击预览等交互体验',
      '数据一致性：确保图片数据在前后端的一致性，避免数据丢失',
    ],
    fixes: [
      '修复图片上传后刷新页面消失的严重问题：实现完整的持久化存储流程',
      '解决临时图片URL失效问题：自动转换为永久存储URL',
      '修复QuestionView中React key重复警告：使用唯一标识符避免渲染冲突',
      '解决图片和图形显示分离问题：合并为统一的媒体内容展示区域',
      '修复图片存储路径不一致问题：统一使用uploads/questions目录结构',
      '解决临时文件清理问题：题目保存后自动删除临时图片文件',
      '修复图片格式转换问题：使用imageService确保图片质量和格式正确',
      '解决图片权限问题：确保图片访问权限与题目权限一致',
      '修复图片元数据丢失问题：完整保存图片的创建时间、上传者等信息',
      '解决图片排序问题：支持按order字段进行图片和图形的统一排序',
      '修复图片预览功能缺失问题：为图片添加点击预览交互',
      '解决图片存储空间浪费问题：及时清理临时文件，优化存储效率',
    ],
    icon: Upload,
    color: 'from-orange-500 to-red-500'
  },
  {
    version: 'v0.72',
    date: '2025-08-24',
    title: 'TikZ渲染系统全面优化：分数渲染增强、虚线样式支持、箭头颜色适配、透明度控制',
    description: '深度优化TikZ渲染引擎，完善分数渲染系统，新增虚线样式支持，实现箭头颜色自动匹配，添加透明度控制，全面提升TikZ图形的显示质量和视觉效果.',
    features: [
      '智能分数渲染系统：支持嵌套大括号解析，Unicode分数字符显示，美观的分数线渲染',
      '完整虚线样式支持：dashed、dotted、loosely dashed、densely dashed等多种线型',
      '箭头颜色自动适配：箭头颜色自动跟随线条颜色，支持12种常见颜色',
      '透明度控制系统：opacity数值设置，预设透明度级别，从完全透明到完全不透明',
      '节点位置智能解析：根据节点在命令中的实际位置确定坐标，修复位置错误问题',
      'LaTeX-to-Unicode转换：希腊字母、数学符号、上下标、分数、根号的Unicode渲染',
      '嵌套大括号处理：智能解析复杂的LaTeX表达式，支持多层嵌套结构',
      '安全渲染机制：避免递归调用，防止渲染错误，提升系统稳定性',
      '分数类型全支持：\\frac、\\dfrac、\\tfrac、\\cfrac统一处理',
      '二项式系数渲染：\\binom命令的美观显示，上下标格式优化',
      '根号渲染优化：平方根和n次根的Unicode显示，支持根指数',
      '颜色映射系统：十六进制颜色值到颜色名称的智能映射',
    ],
    improvements: [
      '分数渲染质量提升：从简单斜杠分隔升级为Unicode分数字符和上下标组合',
      '线型样式完善：支持TikZ标准的所有虚线和点线样式，视觉效果更专业',
      '箭头视觉一致性：箭头颜色与线条完美匹配，消除颜色不一致问题',
      '透明度控制精确化：支持0.0-1.0数值设置和7个预设透明度级别',
      '节点定位准确性：修复节点总是显示在路径末端的问题，实现精确定位',
      'Unicode渲染性能：移除KaTeX依赖，使用原生SVG文本渲染，提升性能',
      '错误处理机制：完善的异常捕获和降级处理，确保渲染稳定性',
      '代码结构优化：模块化设计，分离渲染逻辑，提升可维护性',
      '内存使用优化：减少对象创建，优化渲染算法，降低内存占用',
      '兼容性增强：支持更多LaTeX语法变体，提升用户体验',
      '调试信息完善：详细的错误日志和警告信息，便于问题排查',
      '渲染缓存机制：智能缓存渲染结果，提升重复渲染性能',
    ],
    fixes: [
      '修复分数渲染中嵌套大括号解析错误：重写解析算法，支持复杂嵌套结构',
      '解决虚线样式不显示问题：添加strokeDasharray属性解析和应用',
      '修复箭头颜色不跟随线条颜色问题：实现颜色映射和动态箭头生成',
      '解决透明度属性被忽略问题：完善opacity解析和应用机制',
      '修复节点位置计算错误：重新设计位置算法，根据实际语法确定坐标',
      '解决LaTeX渲染在静态HTML5环境的兼容性问题：移除foreignObject依赖',
      '修复分数内部LaTeX命令不渲染问题：实现递归解析和安全渲染',
      '解决空分数显示异常问题：添加占位符和特殊情况处理',
      '修复Unicode转换中的字符映射错误：完善字符映射表和转换逻辑',
      '解决上下标渲染位置偏移问题：优化Unicode上下标字符使用',
      '修复根号渲染格式不统一问题：标准化根号显示格式',
      '解决颜色名称大小写敏感问题：添加大小写不敏感的颜色匹配',
    ],
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    version: 'v0.71',
    date: '2025-08-23',
    title: 'TikZ教学系统全面构建：完整教程体系、交互式学习、实战项目指导',
    description: '构建完整的TikZ教学系统，包含基础语法、高级技巧、实战案例，提供交互式学习体验，帮助用户从零开始掌握TikZ绘图技能.',
    features: [
      'TikZ基础语法教程：环境搭建、基本命令、坐标系统、图形元素',
      'TikZ高级技巧教学：函数绘制、坐标轴、网格系统、数学公式集成',
      'TikZ实战项目指导：几何图形、函数图像、流程图、组织结构图',
      '交互式学习体验：实时代码编辑、即时预览、错误提示、成功反馈',
      'TikZ符号库完整版：绘制命令、图形命令、节点命令、样式命令',
      '智能代码补全系统：上下文感知、分类过滤、完整示例、语法提示',
      'TikZ渲染引擎详解：SVG生成、坐标转换、图形计算、性能优化',
      'DarkMode主题教学：颜色适配、主题切换、视觉效果、用户体验',
      'TikZ编辑器功能：语法高亮、实时预览、格式转换、代码管理',
      'TikZ效果系统：阴影渲染、渐变填充、模式填充、透明度控制',
      '响应式设计教学：移动端适配、屏幕尺寸、布局优化、交互设计',
      'TikZ最佳实践：代码规范、性能优化、错误处理、调试技巧',
    ],
    improvements: [
      '教学体系结构化：从基础到高级，循序渐进的学习路径',
      '实战案例丰富化：涵盖数学、物理、工程、商业等各个领域',
      '交互体验优化：实时反馈、即时预览、错误纠正、成功鼓励',
      '代码示例标准化：统一格式、清晰注释、完整说明、可运行代码',
      '学习进度跟踪：章节完成、技能掌握、项目实践、能力评估',
      '用户反馈系统：学习建议、改进意见、问题报告、功能需求',
      '移动端学习优化：触摸友好、手势支持、响应式布局、离线学习',
      '性能优化提升：快速加载、流畅动画、内存优化、电池友好',
      '无障碍访问支持：屏幕阅读器、键盘导航、高对比度、字体缩放',
    ],
    fixes: [
      '修复TikZ教程页面导航混乱问题：重新设计导航结构，清晰分类',
      '解决教程内容重复问题：统一整合，避免内容分散和重复',
      '修复TikZ代码示例渲染问题：确保所有示例都能正确显示',
      '解决教程页面样式不一致问题：统一设计风格，保持视觉一致性',
      '修复TikZ语法说明错误：准确反映项目实际支持的TikZ功能',
      '解决教程内容组织混乱问题：重新规划内容结构，逻辑清晰',
      '修复TikZ符号库示例问题：确保所有符号都有正确的使用说明',
      '解决教程页面响应式问题：优化各种屏幕尺寸下的显示效果',
      '修复TikZ实战项目说明错误：准确描述项目步骤和实现方法',
      '解决教程页面动画性能问题：优化动画效果，提升页面流畅度',
      '修复TikZ最佳实践指导错误：提供准确、实用的开发建议',
      '解决教程内容更新问题：建立内容更新机制，保持信息时效性',
    ],
    icon: Palette,
    color: 'from-green-500 to-emerald-500'
  },
  {
    version: 'v0.7',
    date: '2025-08-23',
    title: 'TikZ画图系统全面升级：渲染引擎重构、DarkMode适配、用户体验优化',
    description: '重构TikZ渲染系统，移除PGFPlots依赖，实现纯TikZ函数绘制，全面支持DarkMode，优化图形预览和编辑体验，大幅提升TikZ图形的显示质量和交互体验.',
    features: [
      'TikZ渲染引擎重构：移除PGFPlots依赖，实现纯TikZ函数绘制系统',
      '纯TikZ函数绘制：支持数学函数、三角函数、多项式等复杂函数图像',
      '智能坐标轴系统：标准数学坐标系，支持箭头、网格线、刻度显示',
      'TikZ语法解析器：支持\\draw、\\node、\\plot等核心命令',
      '图形元素支持：直线、矩形、圆形、椭圆、圆弧、箭头等基础图形',
      '节点标签系统：支持位置标注、文本标签、数学公式嵌套',
      '自动缩放系统：智能计算图形边界，自动调整SVG视口适配内容',
      'DarkMode完美适配：透明背景、自适应线条颜色、主题切换支持',
      'TikZ代码编辑器：语法高亮、智能补全、实时预览、错误提示',
      '图形预览优化：QuestionCard、QuestionView中TikZ图片点击放大预览',
      'LaTeX数学公式渲染：完美支持数学符号、公式、特殊字符',
      '响应式设计：各种屏幕尺寸下的完美显示效果',
    ],
    improvements: [
      'TikZ代码自动补全：上下文感知提示、智能过滤、完整示例生成',
      '图形预览区域：透明背景设计、无边框显示、完美居中布局',
      '编辑体验优化：移除编辑/预览切换、对齐编辑窗口和预览区域',
      'TikZ图片显示：QuestionCard和QuestionView中支持点击放大预览',
      '渲染性能提升：前端模拟渲染、无需后端、实时响应',
      '用户界面一致性：所有TikZ相关组件统一设计风格',
      '错误处理机制：友好的错误提示、语法验证、渲染状态反馈',
      '代码结构优化：模块化设计、可维护性提升、扩展性增强',
    ],
    fixes: [
      '修复TikZ图形与边框间隔过大的问题：移除内边距，完全填充容器',
      '解决TikZ图片在QuestionCard中偏移显示的问题：添加居中对齐',
      '修复TikZ图片点击无法预览的问题：实现完整的模态框预览系统',
      '解决TikZ渲染中箭头方向错误的问题：重新设计箭头绘制算法',
      '修复\\draw命令中节点位置解析错误：支持节点在路径中间的位置',
      '解决TikZ代码中空格敏感问题：优化正则表达式，支持灵活空格',
      '修复TikZ图形超出边框的问题：实现智能自动缩放系统',
      '解决DarkMode下线条颜色不适配的问题：实现动态颜色切换',
      '优化TikZ预览模态框：提升z-index、支持滚动、防止被侧边栏遮挡',
      '修复TikZ图片尺寸显示问题：区分容器尺寸和渲染尺寸，提升清晰度',
    ],
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500'
  },
  {
    version: 'v0.69',
    date: '2025-08-19',
    title: 'LaTeX文档系统全面重构：统一设计风格、完善教程内容、优化用户体验',
    description: '重构LaTeX指导中心，采用题目管理页面风格设计，完善数学公式和题目语法教程，统一使用CodeExample组件，提供完整的LaTeX学习体验.',
    features: [
      'LaTeX指导中心全面重构：采用题目管理页面风格，顶部导航栏 + 标签切换设计',
      '统一教程页面结构：数学公式教程 + 题目语法教程，分工明确，内容完整',
      'CodeExample组件统一应用：所有LaTeX示例使用实时渲染，左侧代码右侧效果',
      '数学公式教程完善：基础语法、数学符号库、高级环境、实用示例全覆盖',
      '题目语法教程重构：选择题、填空题、小题结构，完整语法说明和示例',
      'LaTeX渲染系统集成：所有教程内容支持实时LaTeX渲染，所见即所得',
      '响应式设计优化：各种屏幕尺寸下的完美显示，移动端友好体验',
      '深色主题完美支持：所有教程页面DarkMode适配，护眼体验',
      '导航系统优化：顶部快速切换，无需滚动即可访问不同教程区域',
      '代码示例标准化：统一使用$...$包装，单反斜杠语法，规范LaTeX代码',
      '实时预览功能：所有LaTeX代码都有对应的渲染效果，学习更直观',
      '教程内容结构化：分类清晰，层次分明，便于用户系统学习',
    ],
    improvements: [
      '页面布局重新设计：仿照题目管理页面，专业统一的视觉风格',
      '动画效果优化：加快动画速度，提升响应感，减少等待时间',
      '精致拼凑感设计：几何装饰元素，多层次背景，营造专业感',
      '功能卡片重新设计：紧凑布局，几何装饰，悬停光效扫描',
      '标签切换系统：LaTeX编辑器与TikZ绘图分离，清晰的功能分类',
      '教程内容整合：将分散的教程内容统一整合，避免重复和混乱',
      '用户体验提升：简化导航，直接进入学习，减少学习路径复杂度',
      '代码结构优化：移除未使用组件，清理冗余代码，提升维护性',
      '视觉层次优化：半透明卡片，毛玻璃效果，现代化设计语言',
      '交互反馈增强：悬停效果，动画过渡，流畅的用户体验',
      '内容组织优化：逻辑清晰，重点突出，便于用户快速掌握',
      '性能优化：减少不必要的动画和组件，提升页面加载速度',
    ],
    fixes: [
      '修复LaTeX基础教程页面404错误：完善路由配置，确保页面正常访问',
      '解决教程页面重复内容问题：统一整合，避免内容分散和重复',
      '修复LaTeX语法示例渲染问题：统一使用CodeExample组件，确保实时渲染',
      '解决教程导航混乱问题：重新设计导航结构，清晰的功能分类',
      '修复LaTeX代码语法错误：统一使用单反斜杠，规范$...$包装',
      '解决教程页面样式不一致问题：统一设计风格，保持视觉一致性',
      '修复LaTeX环境支持说明错误：准确反映项目实际支持的LaTeX功能',
      '解决教程内容组织混乱问题：重新规划内容结构，逻辑清晰',
      '修复LaTeX符号库示例问题：确保所有数学符号都有正确的渲染效果',
      '解决教程页面响应式问题：优化各种屏幕尺寸下的显示效果',
      '修复LaTeX题目语法说明错误：准确描述\\choice、\\fill、\\subp等命令用法',
      '解决教程页面动画性能问题：优化动画效果，提升页面流畅度',
    ],
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    version: 'v0.68',
    date: '2025-08-17',
    title: '全面升级：DarkMode支持、游戏优化、AI分析改进',
    description: '为所有小游戏组件添加完整的DarkMode支持，修复游戏倒计时bug，优化AI分析机制，重构截图功能，全面提升用户体验.',
    features: [
      '所有小游戏组件完整DarkMode支持：MathGame、MemoryGame、PuzzleGame、ReactionGame',
      '游戏设置、排行榜、历史记录、错误页面游戏区域DarkMode适配',
      'AI分析机制优化：标签优先返回，答案异步生成，提升响应速度',
      'LaTeX表格渲染重构：支持数学公式嵌套，提升复杂内容显示质量',
      '相关题目检测算法优化：排除当前题目，限制结果数量，提高准确性',
      '题库成员管理完善：支持批量操作，权限控制，用户搜索过滤',
      '截图功能重构：提升渲染质量，优化用户体验，支持自定义配置',
      '仪表盘题库区域DarkMode支持：网格和列表视图完美适配',
      '游戏每日限制刷新机制修复：确保限制正确重置',
      '错误处理和用户反馈机制完善：提升系统稳定性',
    ],
    improvements: [
      '游戏倒计时bug修复：解决用户输入时倒计时暂停的问题',
      'LaTeX渲染性能优化：表格和数学公式渲染速度提升',
      '用户界面一致性改进：所有页面DarkMode风格统一',
      '批量操作体验优化：进度显示、结果反馈、错误处理',
      '搜索功能增强：支持LaTeX预览，智能结果分类',
      '响应式设计优化：各种屏幕尺寸下的显示效果',
      '动画效果流畅性提升：页面切换和交互更加自然',
      '代码结构优化：移除冗余代码，提升维护性',
    ],
    fixes: [
      '修复游戏倒计时在用户输入时暂停的严重bug',
      '解决LaTeX表格中数学公式渲染不正确的问题',
      '修复相关题目检测显示当前题目的问题',
      '解决题库成员添加时已存在用户仍可搜索的问题',
      '修复游戏每日限制不会刷新的问题',
      '解决截图功能中LaTeX渲染位置偏移问题',
      '修复部分页面DarkMode下元素显示异常',
      '优化错误处理，提升系统稳定性',
    ],
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500'
  },
  {
    version: 'v0.67',
    date: '2025-08-15',
    title: '成员管理与密码安全升级',
    description: '完善题库成员管理体系，新增批量操作、邮件通知，强化密码重置安全机制，提升协作效率.',
    features: [
      '完整的忘记密码功能：邮件验证 + 安全重置',
      '题库成员批量管理：批量添加/删除，智能选择',
      '成员邮件通知系统：添加/移除即时通知',
      '密码重置邮件：精美HTML模板，24小时有效期',
    ],
    improvements: [
      '批量操作界面：全选/取消、进度显示、结果反馈',
      '邮件模板重新设计：现代化布局，响应式设计',
      '密码重置流程：登录页→邮箱→重置页→成功页',
      '成员管理优化：单个添加vs批量添加，角色权限管理',
    ],
    fixes: [
      '修复忘记密码前检查用户存在性和账号状态',
      '优化邮件发送错误处理，不影响主要功能',
      '修复批量操作中的用户权限检查',
      '完善成员添加/删除的安全验证机制',
    ],
    icon: Users,
    color: 'from-blue-500 to-purple-600'
  },
  {
    version: 'v0.66',
    date: '2025-08-14',
    title: '安全设置与功能优化',
    description: '增强密码安全验证机制，统一头像显示系统，优化截图功能，提升整体用户体验.',
    features: [
      '实现注册密码监管机制：8-20位长度限制',
      '密码智能验证：防止与用户名/邮箱相关的弱密码',
      '统一的Avatar头像组件，支持多种尺寸和形状',
      '密码强度实时显示和详细验证规则提示',
    ],
    improvements: [
      '头像显示统一化：Sidebar、Header、个人信息、企业页面',
      '截图功能优化：更好的排版、字体渲染和视觉效果',
      '密码验证规则：禁止生日日期格式和连续重复字符',
      '截图样式升级：圆形选项标签、更佳间距和阴影效果',
    ],
    fixes: [
      '修复确认模态框在页面跳转后仍显示的问题',
      '优化截图工具的LaTeX公式渲染',
      '统一头像显示逻辑，移除重复代码',
      '改善截图容器的样式和布局问题',
    ],
    icon: Shield,
    color: 'from-emerald-500 to-blue-600'
  },
  {
    version: 'v0.65',
    date: '2025-08-14',
    title: '用户体验全面升级',
    description: '依据Origami、杨浩琪、郭文泽等人的优化建议以及错误检查，优化了本系统并添加了新的功能.',
    features: [
      '全新的自定义弹窗系统，替代原生Alert和Confirm',
      '精致优雅的右上角Toast弹窗，支持自动关闭和进度条',
      '完善的DarkMode支持，提供护眼的深色主题',
    ],
    improvements: [
      '弹窗动画效果更加流畅自然',
      '创建题目中支持根据自动补全功能快速创建数学环境',
      '创建题目中快速补全支持代码增加',
      '主题切换体验更加直观',
      '整体UI设计更加现代化',
      '性能优化，页面加载速度提升',
    ],
    fixes: [
      '修复了部分页面弹窗不显示的问题',
      '解决了DarkMode下某些元素的显示问题',
      '修复了编辑题目时点击上方数学、题目符号试图直接插入时，latex转义符只会生成在整个输入框最开头，而不是所需的目前输入位置的问题'
    ],
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500'
  },
  {
    version: 'v0.64',
    date: '2025-08-11',
    title: 'DarkMode模式',
    description: '全面优化了DarkMode支持，确保在所有页面和组件中都有完美的深色主题体验.',
    features: [
      '所有页面组件都支持DarkMode',
      '自定义弹窗组件完美适配深色主题',
      '表单控件和按钮都有对应的深色样式',
      '支持跟随系统主题自动切换',
    ],
    improvements: [
      '深色主题下的对比度更加合理',
      '颜色搭配更加协调美观',
      '主题切换动画更加流畅',
    ],
    fixes: [
      '修复了深色主题下某些元素的显示问题',
      '解决了主题切换时的闪烁问题'
    ],
    icon: Moon,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    version: 'v0.63',
    date: '2025-08-06',
    title: '批量上传功能',
    description: '实现了文件批量上传的功能，增加了草稿管理与历史记录',
    features: [
      '用户可以对PDF、TeX文件进行上传，扫描之后每一道题都会被显示出来',
      '扫描的文件会放在历史记录当中',
      '编辑了部分但未完成编辑的草稿可保存在草稿管理页面中',
      '如果多道题扫描到一起可进行题目的切割',
      "新增ProcessingProgressCard: 实时处理进度显示",
      "新增ProcessingResultPreview: 处理结果预览",
      "新增ErrorDisplay: 用户友好的错误显示",
    ],
    improvements: [
      '弹窗样式更加美观，支持圆角和阴影效果',
      '动画效果更加流畅，提升用户体验',
      '弹窗内容更加丰富，支持图标和自定义按钮'
    ],
    fixes: [
      '修复了弹窗在某些情况下的显示问题',
      '优化了弹窗的响应式布局'
    ],
    icon: Bell,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    version: 'v0.62',
    date: '2025-08-04',
    title: '游戏系统升级与基础UI组件与系统提示',
    description: '完善了基础UI组件库，提供了更加统一和美观的界面元素，改善了系统通知',
    features: [
      'Button组件支持多种变体和尺寸',
      'Card组件支持多种样式和布局',
      'Input组件支持多种类型和状态',
      'Modal组件支持多种配置选项',
      '系统通知功能更加完善，对处理不同信息会进行不同程度的答复',
      "每日游戏次数超过15次时禁用游戏功能24小时",
      "超过5次时显示警告信息",
      "自动重置每日计数器和禁用状态",

    ],
    improvements: [
      '组件样式更加统一美观',
      '支持更多的自定义选项',
      '组件间的组合更加灵活',
      "添加三个难度等级：简单、中等、困难",
      "简单模式：基础反应测试，8回合，目标大小80px",
      "中等模式：颜色变化，12回合，目标大小60px，2个干扰元素",
      "困难模式：形状+颜色变化，15回合，目标大小40px，4个干扰元素",
      "根据难度调整分数计算：简单800分，中等1000分，困难1200分",
      "添加干扰元素、颜色变化、形状变化等复杂机制",
    ],
    fixes: [
      '修复了某些组件的样式问题',
      '优化了组件的响应式表现',
      "修复游戏进行中无法切换游戏的问题，在游戏进行时禁用游戏切换按钮",
      "修复游戏结束后所有游戏界面都显示结束状态的问题，现在只有当前游戏显示结束状态",
      "为每个游戏添加独立的状态管理，包括isActive和isEnded状态",
    ],
    icon: Palette,
    color: 'from-green-500 to-emerald-500'
  },
  {
    version: 'v0.61',
    date: '2025-08-03',
    title: '个人信息页面与游戏功能优化',
    description: '对系统性能进行了全面优化，提升了页面加载速度和响应性能.',
    features: [
      "添加游戏数据模型",
      "实现游戏API路由",
      "创建四个小游戏组件",
      "添加游戏设置和排行榜组件",
      "实现游戏历史记录功能",
      "添加每日游戏次数限制系统 (5次警告，15次禁用)",
      "集成游戏状态检查和用户统计",
      "添加了用户个人信息页面",
      "添加了收藏题目功能",
    ],
    improvements: [
      "实时排行榜系统",
      "游戏成就系统",
      "用户游戏统计",
      "响应式UI设计",
      "动画效果优化",
    ],
    fixes: [
      '修复了某些性能瓶颈问题',
      '解决了内存泄漏的问题',
    ],
    icon: Zap,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    version: 'v0.60',
    date: '2025-08-02',
    title: '正式开放Beta测试：报错页面与游戏功能',
    description: '404/500等报错页面与游戏模式',
    features: [
      '根据后端与前端的不同错误进入相关页面',
      '每一个报错页面都接入了有关于数学的小游戏',
    ],
    improvements: [
      '题目编辑页面中可快速切换题目',
      '修复单个题目上传中答案验证逻辑错误 - 根据题目类型正确验证答案字段',
    ],
    fixes: [
      '修复了某些特殊字符的显示问题',
      '解决了截图尺寸不准确的问题'
    ],
    icon: FileText,
    color: 'from-red-500 to-pink-500'
  },
  {
    version: 'v0.59',
    date: '2025-08-02',
    title: '编辑题目与截图功能',
    description: '优化了题目卡片的内容与功能，增加了题目预览窗口',
    features: [
      '点击题目卡片可进入题目预览页面',
      '增加了题目截图功能',
      '增加了分享题目的功能',
      '增加了相关题目检测的功能',
      '增加了题目编辑的功能',
    ],
    improvements: [
      '上传题目图片正确识别的几率大幅提升',
      '在DashBoard中介入了页面介绍功能',
      '对上传文件的大小进行限制',
    ],
    fixes: [
      '对上传文件的大小进行限制',
      '解决了大文件上传失败的问题'
    ],
    icon: Upload,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    version: 'v0.58',
    date: '2025-08-01',
    title: '多题扫描功能',
    description: '可通过OCR扫描技术扫描多道题进行上传',
    features: [
      '最高支持10道题一同上传',
      '批量智能识别题目',
      '增加了批量上传题目的处理窗口',
      '批量题目可一键上传至题库'
    ],
    improvements: [
      '修复了创建题目当中LaTeX编辑错误的问题',
      '为LaTeX编辑提供了自动补全功能',
      '为LaTeX编辑提供了不同的支持',
      '优化了实时预览的显示问题',
    ],
    fixes: [
      '修复了无权限用户对题库可进行编辑的问题',
      '修复了无权限用户创建题目的问题'
    ],
    icon: Shield,
    color: 'from-orange-500 to-red-500'
  },
  {
    version: 'v0.57',
    date: '2025-08-01',
    title: '题目创建功能',
    description: '',
    features: [
      'LaTeX编辑器与实时预览功能',
      '为题目选择标签与分类',
      '智能增加题目的出处',
      '为不同类型的题目做出切分',
      '支持OCR扫描图片',
      '支持一键分析题目'
    ],
    improvements: [
      '将题目严格关联至题库',
      'DashBoard当中新增了题目、题库搜索',
      '数据管理更加便捷'
    ],
    fixes: [
      '修复了用户管理页面标签显示问题',
      '修复了用户管理页面普通用户能删除其他用户的问题'
    ],
    icon: Database,
    color: 'from-indigo-500 to-blue-500'
  },
  {
    version: 'v0.56',
    date: '2025-07-31',
    title: '题库功能',
    description: '增加了题库管理功能与题目显示功能',
    features: [
      '用户可创建题库、编辑题目、删除题库',
      '支持与其他用户共享题库',
      '可以设置题库的各类信息与共享者身份',
      '可以查看题库的详细信息',
      '可以查看题库的数据统计与分析',
    ],
    improvements: [
      '删除了用户可编辑题库头像的功能',
      '操作更加便捷'
    ],
    fixes: [
      '修复了公式显示的问题',
      '解决了图片上传的问题',
      '修复了用户管理中无法删除用户的bug'
    ],
    icon: FileText,
    color: 'from-green-500 to-teal-500'
  },
  {
    version: 'v0.54',
    date: '2025-07-31',
    title: '用户管理',
    description: '新增了用户管理功能，支持用户的增删改查和权限管理.',
    features: [
      '用户注册和登录',
      '用户信息管理',
      '密码重置功能',
      '用户状态管理'
    ],
    improvements: [
      '用户管理更加完善',
      '安全性更加可靠',
      '操作更加便捷'
    ],
    fixes: [
      '修复了用户注册的问题',
      '解决了登录验证的问题'
    ],
    icon: Users,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    version: 'v0.53',
    date: '2024-07-30',
    title: '基础功能完善',
    description: '完善了系统的基础功能，包括题库创建、题目管理等核心功能.',
    features: [
      '题库创建和管理',
      '题目添加和编辑',
      '基础的数据统计',
      '简单的用户界面'
    ],
    improvements: [
      '功能更加完整',
      '界面更加美观',
      '操作更加简单'
    ],
    fixes: [
      '修复了基础功能的问题',
      '解决了界面显示的问题'
    ],
    icon: Star,
    color: 'from-yellow-500 to-amber-500'
  },
  {
    version: 'v0.52',
    date: '2025-07-29',
    title: '系统架构搭建',
    description: '搭建了系统的基础架构，包括前端框架、后端API和数据库设计.',
    features: [
      'React + TypeScript前端框架',
      'Node.js + Express后端API',
      'MongoDB数据库设计',
      '基础的路由和状态管理'
    ],
    improvements: [
      '架构更加清晰',
      '代码更加规范',
      '扩展性更加良好'
    ],
    fixes: [
      '修复了架构设计的问题',
      '解决了基础配置的问题'
    ],
    icon: Settings,
    color: 'from-gray-500 to-slate-500'
  },
  {
    version: 'v0.51',
    date: '2025-07-28',
    title: '项目初始化',
    description: '项目正式启动，建立了基础的开发环境和项目结构.',
    features: [
      '项目基础结构搭建',
      '开发环境配置',
      '版本控制系统',
    ],
    improvements: [
      '项目结构更加清晰',
      '开发环境更加完善',
      '文档更加详细'
    ],
    fixes: [
      '修复了环境配置的问题',
      '解决了项目结构的问题'
    ],
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    version: 'v0.5',
    date: '2025-07-27',
    title: '项目概念设计',
    description: 'Mareate题库管理系统的概念设计阶段，确定了系统的核心功能和设计理念.',
    features: [
      '系统功能需求分析',
      '用户界面设计概念',
      '技术架构规划',
      '项目开发计划',
    ],
    improvements: [
      '需求分析更加准确',
      '设计理念更加清晰',
      '规划更加合理'
    ],
    fixes: [
      '完善了需求分析',
      '优化了设计方案'
    ],
    icon: Info,
    color: 'from-slate-500 to-gray-500'
  }
];

const VersionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">版本更新</h1>
              <p className="text-gray-600 dark:text-gray-400">了解Mareate题库管理系统的所有版本更新内容</p>
            </div>
          </div>
        </motion.div>

        {/* 当前版本信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">当前版本 v0.74</h2>
              <p className="text-blue-100 text-lg mb-4">QuestionView动画系统全面优化：简约破碎感设计、快速响应体验、性能大幅提升</p>
              <p className="text-blue-200">
                全面优化QuestionView组件的动画系统，采用简约破碎感设计理念，大幅提升动画速度，优化用户体验，实现快速响应的界面交互效果！
              </p>
            </div>
          </Card>
        </motion.div>

        {/* 版本更新列表 */}
        <div className="space-y-6">
          {versionUpdates.map((update, index) => (
            <motion.div
              key={update.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  {/* 版本头部 */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${update.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <update.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {update.version}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {update.date}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {update.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {update.description}
                      </p>
                    </div>
                  </div>

                  {/* 更新内容 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 新功能 */}
                    {update.features.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 mb-3">
                          <CheckCircle className="w-4 h-4" />
                          新功能
                        </h5>
                        <ul className="space-y-2">
                          {update.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 改进 */}
                    {update.improvements.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">
                          <Zap className="w-4 h-4" />
                          改进
                        </h5>
                        <ul className="space-y-2">
                          {update.improvements.map((improvement, improvementIndex) => (
                            <li key={improvementIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 修复 */}
                    {update.fixes.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-400 mb-3">
                          <Bug className="w-4 h-4" />
                          修复
                        </h5>
                        <ul className="space-y-2">
                          {update.fixes.map((fix, fixIndex) => (
                            <li key={fixIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 版本历史总结 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + versionUpdates.length * 0.05 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                感谢您的支持
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                从v0.5到v0.70，Mareate题库管理系统经历了巨大的发展和改进. 
                我们致力于为用户提供最好的题库管理体验，每一次更新都凝聚着我们的心血和努力. 
                感谢维启象限的全部成员！
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span>总版本数: {versionUpdates.length}</span>
                <span>开发周期: 约1个月</span>
                <span>功能特性: 50+</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VersionPage;
