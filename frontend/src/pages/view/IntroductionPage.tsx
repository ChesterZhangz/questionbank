import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Edit, 
  Users, 
  BarChart3, 
  FileText, 
  Search,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const IntroductionPage: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const features = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "智能题库管理",
      description: "创建、组织和分类您的数学题库，支持多种题型和难度等级",
      animation: "题库创建和管理流程",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Edit className="w-12 h-12" />,
      title: "LaTeX编辑器",
      description: "专业的数学公式编辑器，支持实时预览和语法高亮",
      animation: "LaTeX编辑和预览效果",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Search className="w-12 h-12" />,
      title: "OCR智能识别",
      description: "拍照上传题目，AI自动识别并转换为可编辑格式",
      animation: "图片识别和转换过程",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "数据分析",
      description: "详细的题目统计和用户行为分析，帮助优化教学效果",
      animation: "数据可视化图表",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "协作共享",
      description: "团队协作功能，支持题库共享和权限管理",
      animation: "团队协作场景",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "试卷生成",
      description: "智能生成试卷，支持自定义模板和难度控制",
      animation: "试卷生成流程",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  const handleFeatureClick = (index: number) => {
    setCurrentFeature(index);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentFeature(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航 */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-bg-elevated shadow-sm border-b border-border-primary"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">Mareate 介绍</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 标题区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            欢迎使用
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mareate
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            专业的数学题库管理系统，为教育工作者提供智能化的题目管理、编辑和分享解决方案
          </p>
        </motion.div>

        {/* 功能展示区域 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* 左侧：功能描述 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${features[currentFeature].color} rounded-xl flex items-center justify-center text-white`}>
                  {features[currentFeature].icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {features[currentFeature].title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {features[currentFeature].description}
                </p>
                <div className="flex items-center space-x-2 text-blue-600 font-medium">
                  <span>了解更多</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* 右侧：动画演示 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  功能演示
                </h3>
                <p className="text-sm text-gray-500">
                  {features[currentFeature].animation}
                </p>
              </div>
              
              {/* 模拟界面动画 */}
              <div className="space-y-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                      {features[currentFeature].title}
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    transform: ["translateX(0)", "translateX(10px)", "translateX(0)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      正在处理...
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 功能导航点 */}
        <div className="flex justify-center space-x-4 mb-12">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => handleFeatureClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentFeature 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* 核心优势 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">安全可靠</h3>
            <p className="text-gray-600">数据加密存储，权限管理完善</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">云端同步</h3>
            <p className="text-gray-600">多设备访问，数据实时同步</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">智能高效</h3>
            <p className="text-gray-600">AI辅助功能，提升工作效率</p>
          </div>
        </motion.div>

        {/* 开始使用按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            开始使用 Mareate
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroductionPage; 