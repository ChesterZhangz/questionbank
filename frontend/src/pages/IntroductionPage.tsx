import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageStore } from '../stores/languageStore';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Zap, 
  Shield, 
  Code,
  BarChart3,
  LogIn,
  UserPlus,
  Building2,
  ArrowRight,
  Brain,
  Rocket,
  Moon,
  Sun,
  Calculator,
  PieChart,
  Target,
  Globe
} from 'lucide-react';
import Button from '../components/ui/Button';
import { getLogoPath, getSiteName, getSiteTagline } from '../config/siteConfig';
import { dashboardAPI } from '../services/dashboardAPI';

// 数学宇宙背景组件
const MathUniverseBackground: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 0.6, 0.4, 0.2]);
  const particleOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.8, 0.3]);
  const formulaOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.7, 0.5, 0.2]);

  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #000000 100%)'
      }}
    >
      {/* 动态几何网格 */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: backgroundOpacity }}
      >
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`grid-h-${i}`}
            className="absolute w-full h-px"
            style={{
              top: `${i * 10}%`,
              left: '0%',
              background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`grid-v-${i}`}
            className="absolute h-full w-px"
            style={{
              left: `${i * 12.5}%`,
              top: '0%',
              background: 'linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
            }}
            animate={{
              y: ['-100%', '100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* 数学常数粒子系统 */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: particleOpacity }}
      >
        {[...Array(12)].map((_, i) => {
          const constants = ['π', 'e', 'φ', '√2', '√3', '∞', '∑', '∫', '∂', '∇'];
          const constant = constants[i % constants.length];
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute text-2xl md:text-3xl font-bold pointer-events-none text-cyan-400"
              style={{
                left: `${20 + (i % 4) * 20}%`,
                top: `${20 + (i % 3) * 25}%`,
                filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))'
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            >
              {constant}
            </motion.div>
          );
        })}
      </motion.div>

      {/* 自写数学公式 */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: formulaOpacity }}
      >
        {[
          'E = mc²',
          'f(x) = ∫₀^∞ e^(-x²) dx',
          'lim(x→∞) (1 + 1/x)^x = e',
          '∇·F = ∂F/∂x + ∂F/∂y + ∂F/∂z',
          'e^(iπ) + 1 = 0',
          '∑(n=1)^∞ 1/n² = π²/6'
        ].map((formula, i) => (
          <motion.div
            key={`formula-${i}`}
            className="absolute text-lg md:text-xl font-mono pointer-events-none text-purple-400"
            style={{
              left: `${15 + (i % 3) * 30}%`,
              top: `${20 + (i % 2) * 40}%`,
              filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.4))'
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              rotate: [0, 2, -2, 0],
              scale: [0.8, 1.1, 0.9, 1],
              opacity: [0.3, 0.7, 0.4, 0.6]
            }}
            transition={{
              duration: 25 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          >
            {formula}
          </motion.div>
        ))}
      </motion.div>

      {/* 几何形状变换 */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: backgroundOpacity }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute border-2 pointer-events-none"
            style={{
              left: `${25 + i * 25}%`,
              top: `${30 + i * 20}%`,
              width: '60px',
              height: '60px',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              borderRadius: i % 2 === 0 ? '50%' : '10%',
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.2))'
            }}
            animate={{
              rotate: [0, 90, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// 手写动画组件
const HandwritingAnimation: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 当text改变时重置状态
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100 + delay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay]);

  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {displayedText}
      <motion.span
        className="inline-block w-0.5 h-8 bg-cyan-400 ml-1"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.span>
  );
};

// 2D函数绘图组件
const FunctionGraph: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [currentPoint, setCurrentPoint] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const generatePoints = () => {
      const newPoints = [];
      for (let x = -Math.PI; x <= Math.PI; x += 0.1) {
        const y = Math.sin(x) * 50 + 100; // 正弦波
        newPoints.push({ x: x * 50 + 200, y });
      }
      setPoints(newPoints);
    };

    generatePoints();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || points.length === 0) return;

    const timer = setInterval(() => {
      setCurrentPoint(prev => (prev + 1) % points.length);
    }, 50);

    return () => clearInterval(timer);
  }, [isVisible, points.length]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full h-64 bg-black/20 rounded-lg overflow-hidden">
      <svg className="w-full h-full">
        {/* 坐标轴 */}
        <line x1="50" y1="100" x2="350" y2="100" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2" />
        <line x1="200" y1="50" x2="200" y2="150" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2" />
        
        {/* 函数曲线 */}
        {points.slice(0, currentPoint).map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="rgba(34, 211, 238, 0.8)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          />
        ))}
        
        {/* 连接线 */}
        {currentPoint > 1 && (
          <motion.path
            d={`M ${points[0].x} ${points[0].y} ${points.slice(1, currentPoint).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
            stroke="rgba(34, 211, 238, 0.6)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}
      </svg>
    </div>
  );
};

const IntroductionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // 滚动动画配置 - 简化以提高性能
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 1, 1, 0.95]);

  const [stats, setStats] = useState([
    { label: '**', value: '**', icon: Users, color: 'from-cyan-400 to-blue-500' },
    { label: '**', value: '**', icon: BookOpen, color: 'from-purple-400 to-pink-500' },
    { label: '**', value: '**', icon: FileText, color: 'from-green-400 to-emerald-500' },
    { label: '**', value: '**', icon: Building2, color: 'from-orange-400 to-red-500' }
  ]);
  const [loading, setLoading] = useState(true);

  // 更新统计标签 - 当语言变化时
  useEffect(() => {
    setStats(prevStats => [
      { ...prevStats[0], label: t('introduction.platformData.activeUsers') },
      { ...prevStats[1], label: t('introduction.platformData.questionBanks') },
      { ...prevStats[2], label: t('introduction.platformData.totalQuestions') },
      { ...prevStats[3], label: t('introduction.platformData.enterprises') }
    ]);
  }, [language]);

  const mathBranches = [
    {
      title: t('introduction.mathBranches.algebra.title'),
      icon: Calculator,
      color: 'from-blue-400 to-cyan-500',
      description: t('introduction.mathBranches.algebra.description'),
      animation: 'variables'
    },
    {
      title: t('introduction.mathBranches.geometry.title'),
      icon: Target,
      color: 'from-green-400 to-emerald-500',
      description: t('introduction.mathBranches.geometry.description'),
      animation: 'shapes'
    },
    {
      title: t('introduction.mathBranches.calculus.title'),
      icon: Calculator,
      color: 'from-purple-400 to-pink-500',
      description: t('introduction.mathBranches.calculus.description'),
      animation: 'curves'
    },
    {
      title: t('introduction.mathBranches.statistics.title'),
      icon: PieChart,
      color: 'from-orange-400 to-red-500',
      description: t('introduction.mathBranches.statistics.description'),
      animation: 'data'
    }
  ];

  const features = [
    { icon: BookOpen, title: t('introduction.coreFeatures.intelligentQuestionBank.title'), description: t('introduction.coreFeatures.intelligentQuestionBank.description'), color: 'from-cyan-400 to-blue-500' },
    { icon: Code, title: t('introduction.coreFeatures.latexEditing.title'), description: t('introduction.coreFeatures.latexEditing.description'), color: 'from-purple-400 to-pink-500' },
    { icon: Brain, title: t('introduction.coreFeatures.aiPaperGeneration.title'), description: t('introduction.coreFeatures.aiPaperGeneration.description'), color: 'from-green-400 to-emerald-500' },
    { icon: Users, title: t('introduction.coreFeatures.teamCollaboration.title'), description: t('introduction.coreFeatures.teamCollaboration.description'), color: 'from-orange-400 to-red-500' },
    { icon: BarChart3, title: t('introduction.coreFeatures.dataAnalysis.title'), description: t('introduction.coreFeatures.dataAnalysis.description'), color: 'from-indigo-400 to-purple-500' },
    { icon: Shield, title: t('introduction.coreFeatures.enterpriseSecurity.title'), description: t('introduction.coreFeatures.enterpriseSecurity.description'), color: 'from-teal-400 to-cyan-500' }
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

  // 语言切换函数 - 直接切换
  const handleLanguageToggle = () => {
    const newLanguage = language === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLanguage(newLanguage);
  };


  // 获取统计数据 - 只在用户已登录时调用需要认证的 API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // 用户已登录，调用需要认证的 API
        const [quickStats, userStats, enterpriseStats] = await Promise.all([
          dashboardAPI.getQuickStats(),
          dashboardAPI.getUserStats(),
          fetch('/api/enterprises/stats').then(res => res.json())
        ]);

        setStats([
          { 
              label: t('introduction.platformData.activeUsers'), 
            value: userStats.activeUsers.toLocaleString(), 
            icon: Users, 
              color: 'from-cyan-400 to-blue-500' 
          },
          { 
              label: t('introduction.platformData.questionBanks'), 
            value: quickStats.totalQuestionBanks.toLocaleString(), 
            icon: BookOpen, 
              color: 'from-purple-400 to-pink-500' 
          },
          { 
              label: t('introduction.platformData.totalQuestions'), 
            value: quickStats.totalQuestions.toLocaleString(), 
            icon: FileText, 
              color: 'from-green-400 to-emerald-500' 
          },
          { 
              label: t('introduction.platformData.enterprises'), 
            value: enterpriseStats.success ? enterpriseStats.data.totalEnterprises.toLocaleString() : '0', 
            icon: Building2, 
              color: 'from-orange-400 to-red-500' 
            }
          ]);
        } else {
          // 用户未登录，显示预设数据
          setStats([
            { 
              label: t('introduction.platformData.activeUsers'), 
              value: '**', 
              icon: Users, 
              color: 'from-cyan-400 to-blue-500' 
            },
            { 
              label: t('introduction.platformData.questionBanks'), 
              value: '**', 
              icon: BookOpen, 
              color: 'from-purple-400 to-pink-500' 
            },
            { 
              label: t('introduction.platformData.totalQuestions'), 
              value: '**', 
              icon: FileText, 
              color: 'from-green-400 to-emerald-500' 
            },
            { 
              label: t('introduction.platformData.enterprises'), 
              value: '**', 
              icon: Building2, 
              color: 'from-orange-400 to-red-500' 
            }
          ]);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 使用默认数据
        setStats([
          { 
            label: t('introduction.platformData.activeUsers'), 
            value: '**', 
            icon: Users, 
            color: 'from-cyan-400 to-blue-500' 
          },
          { 
            label: t('introduction.platformData.questionBanks'), 
            value: '**', 
            icon: BookOpen, 
            color: 'from-purple-400 to-pink-500' 
          },
          { 
            label: t('introduction.platformData.totalQuestions'), 
            value: '**', 
            icon: FileText, 
            color: 'from-green-400 to-emerald-500' 
          },
          { 
            label: t('introduction.platformData.enterprises'), 
            value: '**', 
            icon: Building2, 
            color: 'from-orange-400 to-red-500' 
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);


  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">
      <style dangerouslySetInnerHTML={{
        __html: `
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
          .overflow-x-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .glassmorphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .glow {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          }
        `
      }} />
      
      {/* 数学宇宙背景 */}
      <MathUniverseBackground />
      
      {/* 顶部导航栏 */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 glassmorphism"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden glow">
                <img 
                  src={getLogoPath(true)} 
                  alt="Mareate Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {getSiteName()}
                </h1>
                <p className="text-sm text-cyan-400">
                  {getSiteTagline()}
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* 语言切换按钮 - 直接点击切换 */}
              <motion.button
                onClick={handleLanguageToggle}
                className="flex items-center space-x-2 p-2 rounded-lg glassmorphism text-cyan-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {language === 'zh-CN' ? '中文' : 'English'}
                </span>
              </motion.button>

              {/* 主题切换按钮 */}
              <motion.button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg glassmorphism text-cyan-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleEnterQuestionBank} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 glow"
                  >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('introduction.navigation.enterQuestionBank')}
                </Button>
                </motion.div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/login')}
                      className="glassmorphism text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black"
                    >
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('introduction.navigation.login')}
                  </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => navigate('/register')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 glow"
                    >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('introduction.navigation.register')}
                  </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* 主要内容 - 数学宇宙设计 */}
      <main className="relative z-20">
        {/* 英雄区域 - 数学宇宙布局 */}
        <motion.section 
          className="relative min-h-screen flex items-center justify-center px-8"
          style={{ y: parallaxY, scale, opacity }}
        >
          {/* 中心内容区域 */}
        <motion.div 
            className="text-center max-w-6xl mx-auto relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <motion.h1 
              className="text-8xl md:text-9xl font-black mb-8 leading-tight text-white"
              initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.3, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 80,
                damping: 15
              }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -200 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 1, 
                  delay: 0.5, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 120,
                  damping: 20
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <HandwritingAnimation text="Unlock the Universe of Mathematics" delay={0} />
              </motion.span>
            </motion.h1>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1, 
                delay: 1.5, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 80,
                damping: 12
              }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }
                }}
                whileTap={{ 
                  scale: 0.95
                }}
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(34, 211, 238, 0.3)',
                    '0 0 50px rgba(34, 211, 238, 0.5)',
                    '0 0 30px rgba(34, 211, 238, 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Button 
                  size="lg" 
                  onClick={handleGetStarted} 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-2xl px-16 py-8 font-bold glow"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Rocket className="w-8 h-8 mr-4" />
                  </motion.div>
                  {t('introduction.hero.getStarted')}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-8 h-8 ml-4" />
                  </motion.div>
            </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }
                }}
                whileTap={{ 
                  scale: 0.95
                }}
                animate={{
                  borderColor: [
                    'rgba(34, 211, 238, 0.3)',
                    'rgba(147, 51, 234, 0.5)',
                    'rgba(34, 211, 238, 0.3)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/LaTeXGuide')} 
                  className="glassmorphism text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black text-2xl px-16 py-8 font-bold"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Code className="w-8 h-8 mr-4" />
                  </motion.div>
                  {t('introduction.hero.learnGuide')}
            </Button>
              </motion.div>
        </motion.div>

            {/* 滚动指示器 */}
        <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
            </motion.div>
          </motion.div>
        </motion.section>

        {/* 数学分支自动横向滚动展示区域 */}
        <motion.section 
          ref={containerRef}
          className="relative bg-black/50 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          {/* 固定标题区域 */}
          <div className="relative z-20 bg-black/80 backdrop-blur-md border-b border-cyan-400/20 py-16">
            <div className="max-w-7xl mx-auto px-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.h2 
                  className="text-6xl font-black mb-4 text-white"
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {t('introduction.mathBranches.title')}
                </motion.h2>
                
                <motion.p 
                  className="text-2xl font-light leading-relaxed text-cyan-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {t('introduction.mathBranches.subtitle')}
                </motion.p>
              </motion.div>
                </div>
                </div>

          {/* 自动横向滚动容器 */}
          <div className="relative h-[600vh]">
            {/* 横向滚动进度指示器 */}
            <motion.div 
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex space-x-4">
                {mathBranches.map((branch) => {
                  return (
                    <motion.div
                      key={branch.title}
                      className="w-3 h-3 rounded-full border-2 border-cyan-400 bg-transparent"
                      whileHover={{ scale: 1.5 }}
                    />
                  );
                })}
                </div>
        </motion.div>

            {/* 固定横向滚动内容 - 始终在屏幕中央 */}
        <motion.div 
              className="fixed top-1/2 left-0 transform -translate-y-1/2 h-screen w-full overflow-hidden z-10"
              style={{
                opacity: useTransform(scrollYProgress, [0.1, 0.15, 0.6, 0.65], [0, 1, 1, 0])
              }}
            >
              <motion.div 
                className="flex h-full w-[400vw]"
                style={{
                  x: useTransform(scrollYProgress, [0.15, 0.3, 0.45, 0.6], ['0vw', '-100vw', '-200vw', '-300vw'])
                }}
              >
                {mathBranches.map((branch, index) => (
                  <div
                    key={branch.title}
                    className="w-screen h-full flex items-center justify-center px-8"
                  >
                    {/* 创新框架 - 圆形设计 */}
                    <motion.div 
                      className="relative group max-w-4xl w-full"
                      whileHover={{ scale: 1.05, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                    {/* 圆形背景 */}
                    <motion.div
                      className="w-full h-[600px] relative rounded-3xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${branch.color.split(' ')[1]}20, ${branch.color.split(' ')[3]}20)`,
                        border: '2px solid rgba(34, 211, 238, 0.3)'
                      }}
                      animate={{
                        borderColor: [
                          'rgba(34, 211, 238, 0.3)',
                          'rgba(34, 211, 238, 0.8)',
                          'rgba(34, 211, 238, 0.3)'
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {/* 内部发光效果 */}
                      <motion.div
                        className="absolute inset-4 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${branch.color.split(' ')[1]}10, ${branch.color.split(' ')[3]}10)`,
                          filter: 'blur(20px)'
                        }}
                        animate={{
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      {/* 数学符号装饰 */}
                      <motion.div
                        className="absolute top-8 right-8 text-6xl opacity-20"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {branch.title === t('introduction.mathBranches.algebra.title') && t('introduction.mathBranches.algebra.symbol')}
                        {branch.title === t('introduction.mathBranches.geometry.title') && t('introduction.mathBranches.geometry.symbol')}
                        {branch.title === t('introduction.mathBranches.calculus.title') && t('introduction.mathBranches.calculus.symbol')}
                        {branch.title === t('introduction.mathBranches.statistics.title') && t('introduction.mathBranches.statistics.symbol')}
                      </motion.div>

                      {/* 主要内容 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        {/* 图标 */}
                        <motion.div 
                          className={`w-32 h-32 rounded-full flex items-center justify-center text-white mb-8 bg-gradient-to-r ${branch.color} glow`}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(34, 211, 238, 0.3)',
                              '0 0 60px rgba(34, 211, 238, 0.6)',
                              '0 0 30px rgba(34, 211, 238, 0.3)'
                            ]
                          }}
                        >
                          <branch.icon className="w-16 h-16" />
                        </motion.div>
                        
                        {/* 标题 */}
                        <motion.h3 
                          className="text-5xl font-black text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          {branch.title}
                        </motion.h3>
                        
                        {/* 描述 */}
                        <motion.p 
                          className="text-2xl text-cyan-300 font-medium mb-8 leading-relaxed max-w-2xl"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          {branch.description}
                        </motion.p>

                        {/* 特殊动画展示 */}
                        {branch.animation === 'curves' && (
                          <motion.div
                            className="w-full h-48 mb-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
                            <FunctionGraph isVisible={true} />
                          </motion.div>
                        )}

                        {branch.animation === 'variables' && (
              <motion.div
                            className="text-4xl font-mono text-cyan-400 mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          >
                            <motion.span
                              animate={{
                                x: [0, 10, -10, 0],
                                color: ['#22d3ee', '#06b6d4', '#0891b2', '#22d3ee']
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              x² + 2x + 1 = (x + 1)²
                            </motion.span>
                          </motion.div>
                        )}

                        {branch.animation === 'shapes' && (
                          <motion.div
                            className="flex justify-center space-x-8 mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          >
                            {['△', '□', '○', '◇'].map((shape, i) => (
                              <motion.div
                                key={shape}
                                className="text-5xl text-cyan-400"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  y: [0, -10, 0]
                                }}
                                transition={{
                                  duration: 2 + i * 0.5,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: i * 0.2
                                }}
                              >
                                {shape}
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {branch.animation === 'data' && (
                          <motion.div
                            className="flex justify-center space-x-4 mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          >
                            {[1, 2, 3, 4, 5].map((height, i) => (
                              <motion.div
                                key={i}
                                className="w-8 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t"
                                style={{ height: `${height * 30}px` }}
                                animate={{
                                  scaleY: [0, 1, 0.8, 1],
                                  opacity: [0.5, 1, 0.7, 1]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: i * 0.1
                                }}
                              />
                            ))}
                          </motion.div>
                        )}

                        {/* 探索按钮 */}
                        <motion.button
                          className="px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full glow text-lg"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(34, 211, 238, 0.3)',
                              '0 0 60px rgba(34, 211, 238, 0.6)',
                              '0 0 30px rgba(34, 211, 238, 0.3)'
                            ]
                          }}
                          transition={{
                            boxShadow: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }}
                        >
                          {t('introduction.mathBranches.exploreButton')} {branch.title}
                        </motion.button>
                    </div>
                    </motion.div>

                    {/* 连接线到下一个分支 */}
                    {index < mathBranches.length - 1 && (
                      <motion.div
                        className="absolute top-1/2 -right-20 w-40 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"
                        style={{
                          transform: 'translateY(-50%)'
                        }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    )}
                  </motion.div>
                      </div>
                    ))}
              </motion.div>
            </motion.div>
                  </div>
        </motion.section>

        {/* 平台数据统计 */}
        <motion.section 
          className="relative py-32 px-8 bg-gradient-to-b from-black/50 to-black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.h2 
                className="text-6xl font-black mb-8 text-white"
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {t('introduction.platformData.title')}
              </motion.h2>
              
              <motion.p 
                className="text-2xl font-light mb-12 leading-relaxed text-cyan-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {t('introduction.platformData.subtitle')}
              </motion.p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group relative glassmorphism rounded-2xl p-8"
                  initial={{ opacity: 0, y: 100, scale: 0.5 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <motion.div 
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 bg-gradient-to-r ${stat.color} glow`}
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <stat.icon className="w-10 h-10" />
                  </motion.div>
                  
                  <motion.div 
                    className="text-5xl font-black mb-2 text-white"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.3 + index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    {loading ? (
                      <div className="animate-pulse h-12 w-40 rounded mx-auto bg-gray-700"></div>
                    ) : (
                      stat.value
                    )}
                  </motion.div>
                  
                  <div className="text-xl font-medium text-cyan-300">
                    {stat.label}
                      </div>
              </motion.div>
            ))}
          </div>
          </div>
        </motion.section>

        {/* 核心功能展示 */}
        <motion.section 
          className="relative py-32 px-8 bg-gradient-to-b from-black to-black/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="text-6xl font-black text-white mb-6">{t('introduction.coreFeatures.title')}</h2>
              <p className="text-2xl text-cyan-300 font-light">{t('introduction.coreFeatures.subtitle')}</p>
        </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {features.map((feature, index) => (
        <motion.div 
                  key={feature.title}
                  className="text-center group glassmorphism rounded-2xl p-8"
                  initial={{ opacity: 0, y: 100, scale: 0.5, rotateY: -90 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  whileHover={{ y: -20, scale: 1.05, rotateY: 10 }}
                >
                  <motion.div 
                    className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 bg-gradient-to-r ${feature.color} glow`}
                    whileHover={{ rotate: 720, scale: 1.3 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <feature.icon className="w-12 h-12" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                </h3>
                  
                  <p className="text-cyan-300 text-lg font-medium mb-6">
                    {feature.description}
                  </p>
                  
                  <motion.div 
                    className="flex justify-center mt-6"
                    initial={{ opacity: 0, x: -30, scale: 0 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.3 + index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ x: 10, scale: 1.2 }}
                  >
                    <ArrowRight className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors duration-200" />
                  </motion.div>
                </motion.div>
              ))}
                </div>
              </div>
        </motion.section>

        {/* 技术优势展示 */}
        <motion.section 
          className="relative py-32 px-8 bg-gradient-to-b from-black/80 to-black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="text-6xl font-black text-white mb-6">{t('introduction.technicalAdvantages.title')}</h2>
              <p className="text-2xl text-cyan-300 font-light">{t('introduction.technicalAdvantages.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                {
                  icon: Zap,
                  title: t('introduction.technicalAdvantages.highPerformance.title'),
                  description: t('introduction.technicalAdvantages.highPerformance.description'),
                  color: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: Shield,
                  title: t('introduction.technicalAdvantages.bankLevelSecurity.title'),
                  description: t('introduction.technicalAdvantages.bankLevelSecurity.description'),
                  color: 'from-green-400 to-emerald-500'
                },
                {
                  icon: Globe,
                  title: t('introduction.technicalAdvantages.crossPlatform.title'),
                  description: t('introduction.technicalAdvantages.crossPlatform.description'),
                  color: 'from-purple-400 to-pink-500'
                }
              ].map((tech, index) => (
                <motion.div
                  key={tech.title}
                  className="text-center group glassmorphism rounded-2xl p-8"
                  initial={{ opacity: 0, y: 100, scale: 0.5, rotateX: -90 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  whileHover={{ y: -20, scale: 1.05, rotateY: 10 }}
                >
                  <motion.div 
                    className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 bg-gradient-to-r ${tech.color} glow`}
                    whileHover={{ rotate: 720, scale: 1.3 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <tech.icon className="w-12 h-12" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {tech.title}
                  </h3>
                  
                  <p className="text-cyan-300 text-lg font-medium">
                    {tech.description}
                  </p>
                </motion.div>
              ))}
                </div>
            </div>
        </motion.section>

        {/* 行动召唤区域 */}
        <motion.section 
          className="relative py-32 px-8 bg-gradient-to-b from-black to-black/90"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2 
              className="text-7xl font-black text-white mb-8"
              initial={{ opacity: 0, y: 100, scale: 0.5, rotateX: -90 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {t('introduction.callToAction.title')}
            </motion.h2>
            
            <motion.p 
              className="text-3xl text-cyan-300 mb-16 font-light"
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {t('introduction.callToAction.subtitle')}
            </motion.p>
            
        <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -10, rotateX: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-3xl px-20 py-10 font-bold glow"
              >
                  <Rocket className="w-10 h-10 mr-4" />
                  {t('introduction.callToAction.startNow')}
                  <ArrowRight className="w-10 h-10 ml-4" />
              </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1, y: -10, rotateX: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/LaTeXGuide')}
                  className="glassmorphism text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black text-3xl px-20 py-10 font-bold transition-all duration-200"
              >
                  <Code className="w-10 h-10 mr-4" />
                  {t('introduction.callToAction.learnGuide')}
              </Button>
        </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* 页脚 */}
      <motion.footer 
        className="relative bg-black text-white py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl overflow-hidden glow">
                  <img 
                    src={getLogoPath(true)} 
                    alt="Mareate Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('introduction.footer.companyName')}</h3>
                  <p className="text-sm text-cyan-400">{t('introduction.footer.tagline')}</p>
                </div>
              </div>
              <p className="text-cyan-300 text-lg font-light">
                {t('introduction.footer.description')}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-xl font-bold mb-6 text-white">{t('introduction.footer.productFeatures')}</h4>
              <ul className="space-y-3 text-cyan-300">
                {[
                  t('introduction.coreFeatures.intelligentQuestionBank.title'),
                  t('introduction.coreFeatures.latexEditing.title'),
                  t('introduction.coreFeatures.aiPaperGeneration.title'),
                  t('introduction.coreFeatures.teamCollaboration.title')
                ].map((item, index) => (
                  <motion.li 
                    key={item}
                    className="flex items-center space-x-2 hover:text-white transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 5, scale: 1.05 }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-xl font-bold mb-6 text-white">{t('introduction.footer.technicalSupport')}</h4>
              <ul className="space-y-3 text-cyan-300">
                {[
                  t('introduction.footer.technicalSupportList.0'),
                  t('introduction.footer.technicalSupportList.1'),
                  t('introduction.footer.technicalSupportList.2'),
                  t('introduction.footer.technicalSupportList.3')
                ].map((item, index) => (
                  <motion.li 
                    key={item}
                    className="flex items-center space-x-2 hover:text-white transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 5, scale: 1.05 }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-xl font-bold mb-6 text-white">{t('introduction.footer.contactUs')}</h4>
              <ul className="space-y-3 text-cyan-300">
                {[
                  t('introduction.footer.contactUsList.0'),
                  t('introduction.footer.contactUsList.1'),
                  t('introduction.footer.contactUsList.2'),
                  t('introduction.footer.contactUsList.3')
                ].map((item, index) => (
                  <motion.li 
                    key={item}
                    className="flex items-center space-x-2 hover:text-white transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 5, scale: 1.05 }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <motion.div 
            className="border-t border-cyan-400/20 pt-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-cyan-300 text-lg font-light">
              {t('introduction.footer.copyright')}
            </p>
          </motion.div>
          </div>
      </motion.footer>
    </div>
  );
};

export default IntroductionPage;
