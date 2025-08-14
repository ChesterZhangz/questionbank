import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Settings, Plus, Eye, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaperGenerationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-bg-elevated/80 dark:border-border-primary shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  组卷系统
                </h1>
                <p className="text-gray-600 dark:text-text-secondary mt-1">智能生成试卷，快速创建高质量题目组合</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* 组卷统计面板 */}
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        可用题目: 0 题
                      </span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl px-4 py-2 border border-green-200 dark:border-green-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        已组卷: 0 份
                      </span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl px-4 py-2 border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        平均难度: 3.0
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：组卷配置 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-fit">
              <div className="p-6 border-b border-gray-200 dark:border-border-primary bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">组卷配置</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">试卷名称</label>
                  <input
                    type="text"
                    placeholder="请输入试卷名称"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-bg-elevated text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">试卷类型</label>
                  <select className="w-full px-4 py-3 border border-gray-200 dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-bg-elevated text-text-primary">
                    <option value="">选择题库类型</option>
                    <option value="quiz">小测验</option>
                    <option value="midterm">期中考试</option>
                    <option value="final">期末考试</option>
                    <option value="practice">练习卷</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">题目数量</label>
                  <input
                    type="number"
                    placeholder="请输入题目数量"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-bg-elevated text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">难度分布</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-text-tertiary">简单 (1-2星)</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-20 px-3 py-2 border border-gray-200 dark:border-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-bg-elevated text-text-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-text-tertiary">中等 (3星)</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-20 px-3 py-2 border border-gray-200 dark:border-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-bg-elevated text-text-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-text-tertiary">困难 (4-5星)</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-20 px-3 py-2 border border-gray-200 dark:border-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-bg-elevated text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">知识点标签</label>
                  <input
                    type="text"
                    placeholder="输入知识点标签，用逗号分隔"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-bg-elevated text-text-primary"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  开始组卷
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* 右侧：试卷预览和操作 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 试卷预览 */}
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-border-primary bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">试卷预览</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      导出PDF
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      导出Word
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-12 h-12 text-gray-400 dark:text-text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-text-primary mb-2">暂无试卷</h3>
                  <p className="text-gray-500 dark:text-text-tertiary mb-6">请先配置组卷参数，然后点击"开始组卷"生成试卷</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400 dark:text-text-tertiary">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-text-tertiary rounded-full"></div>
                      <span>选择题库</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-text-tertiary"></div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-text-tertiary rounded-full"></div>
                      <span>配置参数</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-text-tertiary"></div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-text-tertiary rounded-full"></div>
                      <span>生成试卷</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 最近生成的试卷 */}
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-border-primary bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">最近生成的试卷</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-400 dark:text-text-tertiary" />
                  </div>
                  <p className="text-gray-500 dark:text-text-tertiary">暂无最近生成的试卷</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaperGenerationPage; 