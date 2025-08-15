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
    version: 'v0.66',
    date: '2025-01-28',
    title: '安全设置与功能优化',
    description: '增强密码安全验证机制，统一头像显示系统，优化截图功能，提升整体用户体验。',
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
    description: '全面优化了DarkMode支持，确保在所有页面和组件中都有完美的深色主题体验。',
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
    description: '对系统性能进行了全面优化，提升了页面加载速度和响应性能。',
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
    description: '新增了用户管理功能，支持用户的增删改查和权限管理。',
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
    description: '完善了系统的基础功能，包括题库创建、题目管理等核心功能。',
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
    description: '搭建了系统的基础架构，包括前端框架、后端API和数据库设计。',
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
    description: '项目正式启动，建立了基础的开发环境和项目结构。',
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
    description: 'Mareate题库管理系统的概念设计阶段，确定了系统的核心功能和设计理念。',
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
              <h2 className="text-2xl font-bold mb-2">当前版本 v0.65</h2>
              <p className="text-blue-100 text-lg mb-4">用户体验全面升级</p>
              <p className="text-blue-200">
                本次更新带来了全新的用户界面和交互体验，让题库管理更加高效便捷. 
                包括全新的自定义弹窗系统、完善的DarkMode支持、优化的响应式布局等. 
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
                从v0.5到v0.65，Mareate题库管理系统经历了巨大的发展和改进. 
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
