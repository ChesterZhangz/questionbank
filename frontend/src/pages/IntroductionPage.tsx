import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Target, 
  Zap, 
  Shield, 
  Globe, 
  Play,
  CheckCircle,
  Code,
  BarChart3,
  LogIn,
  UserPlus,
  Building2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getLogoPath, getSiteName, getSiteTagline } from '../config/siteConfig';
import { dashboardAPI } from '../services/dashboardAPI';

const IntroductionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState([
    { label: '活跃用户', value: '加载中...', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: '题库数量', value: '加载中...', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { label: '题目总数', value: '加载中...', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { label: '企业数量', value: '加载中...', icon: Building2, color: 'from-orange-500 to-red-500' }
  ]);
  const [loading, setLoading] = useState(true);


  const features = [
    {
      id: 'question-banks',
      icon: BookOpen,
      title: '智能题库管理',
      description: '创建、组织和维护您的题库，支持多种题型和分类',
      color: 'from-blue-500 to-cyan-500',
      benefits: ['多级分类系统', '智能标签管理', '批量操作支持', '权限控制']
    },
    {
      id: 'question-creation',
      icon: FileText,
      title: '专业题目编辑',
      description: '强大的LaTeX编辑器，支持数学公式和复杂图形',
      color: 'from-green-500 to-emerald-500',
      benefits: ['LaTeX语法高亮', '实时预览', 'TikZ图形绘制', '模板库']
    },
    {
      id: 'paper-generation',
      icon: Target,
      title: '智能组卷系统',
      description: '基于AI的智能组卷，自动生成高质量试卷',
      color: 'from-indigo-600 to-purple-600',
      benefits: ['智能难度控制', '题型平衡', '时间分配', '质量评估']
    },
    {
      id: 'collaboration',
      icon: Users,
      title: '团队协作',
      description: '支持团队协作，共享题库和试卷资源',
      color: 'from-orange-500 to-red-500',
      benefits: ['角色权限管理', '实时同步', '版本控制', '评论系统']
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: '数据分析',
      description: '全面的数据分析和统计报告',
      color: 'from-indigo-500 to-purple-500',
      benefits: ['使用统计', '性能分析', '用户行为', '趋势预测']
    },
    {
      id: 'security',
      icon: Shield,
      title: '安全可靠',
      description: '企业级安全保护，确保数据安全',
      color: 'from-teal-500 to-blue-500',
      benefits: ['数据加密', '访问控制']
    }
  ];



  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleEnterQuestionBank = () => {
    navigate('/question-banks');
  };

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [quickStats, userStats, enterpriseStats] = await Promise.all([
          dashboardAPI.getQuickStats(),
          dashboardAPI.getUserStats(),
          fetch('/api/enterprises/stats').then(res => res.json())
        ]);

        // 更新统计数据
        setStats([
          { 
            label: '活跃用户', 
            value: userStats.activeUsers.toLocaleString(), 
            icon: Users, 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: '题库数量', 
            value: quickStats.totalQuestionBanks.toLocaleString(), 
            icon: BookOpen, 
            color: 'from-green-500 to-emerald-500' 
          },
          { 
            label: '题目总数', 
            value: quickStats.totalQuestions.toLocaleString(), 
            icon: FileText, 
            color: 'from-indigo-600 to-purple-600' 
          },
          { 
            label: '企业数量', 
            value: enterpriseStats.success ? enterpriseStats.data.totalEnterprises.toLocaleString() : '0', 
            icon: Building2, 
            color: 'from-orange-500 to-red-500' 
          }
        ]);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 设置默认数据
        setStats([
          { label: '活跃用户', value: '0', icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: '题库数量', value: '0', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
          { label: '题目总数', value: '0', icon: FileText, color: 'from-indigo-600 to-purple-600' },
          { label: '企业数量', value: '0', icon: Building2, color: 'from-orange-500 to-red-500' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img 
                  src={getLogoPath(theme === 'dark')} 
                  alt="Mareate Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {getSiteName()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getSiteTagline()}
                </p>
              </div>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center space-x-4">
              {/* 主题切换 */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'dark' ? <Globe className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
              </button>

              {/* 登录/注册 或 进入题库 */}
              {user ? (
                <Button onClick={handleEnterQuestionBank} className="bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="w-4 h-4 mr-2" />
                  进入题库
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    注册
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            专业的
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              题库管理
            </span>
            平台
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            为教育工作者提供强大的题库创建、管理和组卷工具，支持LaTeX数学公式和TikZ图形绘制，
            让教学资源管理变得简单高效。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              <Play className="w-5 h-5 mr-2" />
              开始使用
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/LaTeXGuide')} className="text-lg px-8 py-4">
              <Code className="w-5 h-5 mr-2" />
              查看指南
            </Button>
          </div>
        </motion.div>

        {/* 统计数据 */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center p-6">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* 核心功能 */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              核心功能
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              我们提供全方位的题库管理解决方案，从创建到组卷，从个人使用到团队协作
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}

              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 技术优势 */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                技术优势
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                基于现代Web技术构建，提供卓越的用户体验
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  高性能
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  优化的算法和架构，确保快速响应和流畅操作
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  安全可靠
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  企业级安全保护，确保数据安全和隐私保护
                </p>
              </div>

                              <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    跨平台
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    支持各种设备和浏览器，随时随地访问
                  </p>
                </div>
            </div>
          </Card>
        </motion.div>

        {/* 行动召唤 */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">
              准备好开始了吗？
            </h2>
            <p className="text-xl mb-8 opacity-90">
              加入我们，体验专业的题库管理平台
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-lg font-semibold border-2 border-white"
              >
                <Play className="w-5 h-5 mr-2" />
                立即开始
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/LaTeXGuide')}
                className="border-2 text-blue-600 hover:bg-white hover:text-blue-600 text-lg px-8 py-4 shadow-lg font-semibold transition-all duration-300"
              >
                <Code className="w-5 h-5 mr-2" />
                学习指南
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img 
                    src={getLogoPath(true)} 
                    alt="Mareate Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Mareate</h3>
                  <p className="text-sm text-gray-400">专业题库管理平台</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                为教育工作者提供强大的题库创建、管理和组卷工具
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">产品功能</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>题库管理</li>
                <li>题目编辑</li>
                <li>智能组卷</li>
                <li>团队协作</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">技术支持</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>LaTeX指南</li>
                <li>TikZ教程</li>
                <li>API文档</li>
                <li>帮助中心</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>客服支持</li>
                <li>商务合作</li>
                <li>意见反馈</li>
                <li>关于我们</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Mareate. 保留所有权利。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroductionPage;
