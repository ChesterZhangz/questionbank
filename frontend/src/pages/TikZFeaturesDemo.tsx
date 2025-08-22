import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ColorParser, 
  GradientEngine, 
  ShadowRenderer
} from '../components/tikz';

const TikZFeaturesDemo: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<'colors' | 'gradients' | 'shadows' | 'patterns'>('colors');



  // 颜色演示
  const renderColorsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">颜色系统演示</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['red', 'blue', 'green', '#FF6B6B', 'rgb(255, 107, 107)', 'rgba(255, 107, 107, 0.5)', 'cmyk(0, 0.5, 0.5, 0)', 'gray(0.5)'].map((color) => {
          const parsed = ColorParser.parse(color);
          return (
            <motion.div
              key={color}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div 
                className="w-full h-20 rounded mb-2"
                style={{ backgroundColor: parsed.value }}
              />
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mb-1">
                {color}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                类型: {parsed.type}
              </p>
              {parsed.opacity && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  透明度: {parsed.opacity}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">颜色混合演示</h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { color1: 'red', color2: 'blue', weight: 0.5 },
            { color1: 'yellow', color2: 'blue', weight: 0.3 },
            { color1: 'green', color2: 'red', weight: 0.7 }
                     ].map((mix, index) => {
             const mixedColor = ColorParser.mix(mix.color1, mix.color2, mix.weight);
             return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex space-x-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: mix.color1 }}
                  />
                  <div className="flex items-center">
                    <span className="text-sm">+</span>
                  </div>
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: mix.color2 }}
                  />
                </div>
                <div 
                  className="w-full h-16 rounded mb-2"
                  style={{ backgroundColor: mixedColor }}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  混合比例: {mix.weight}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 渐变演示
  const renderGradientsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">渐变效果演示</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: '水平渐变', gradient: GradientEngine.createHorizontalGradient([
            { offset: '0%', color: 'red' },
            { offset: '100%', color: 'blue' }
          ])},
          { name: '垂直渐变', gradient: GradientEngine.createVerticalGradient([
            { offset: '0%', color: 'yellow' },
            { offset: '100%', color: 'green' }
          ])},
          { name: '对角渐变', gradient: GradientEngine.createDiagonalGradient([
            { offset: '0%', color: 'purple' },
            { offset: '100%', color: 'orange' }
          ])},
          { name: '彩虹渐变', gradient: GradientEngine.createRainbowGradient()}
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              {item.name}
            </h4>
            <div 
              className="w-full h-32 rounded"
              style={{ background: GradientEngine.getCSSGradient(item.gradient) }}
            />
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">特殊渐变效果</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: '金属渐变', gradient: GradientEngine.createMetallicGradient('silver') },
            { name: '玻璃渐变', gradient: GradientEngine.createGlassGradient('white') },
            { name: '阴影渐变', gradient: GradientEngine.createShadowGradient('black') }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h5 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">
                {item.name}
              </h5>
              <div 
                className="w-full h-24 rounded"
                style={{ background: GradientEngine.getCSSGradient(item.gradient) }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // 阴影演示
  const renderShadowsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">阴影效果演示</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: '默认阴影', shadow: ShadowRenderer.createDefaultShadow() },
          { name: '柔和阴影', shadow: ShadowRenderer.createSoftShadow() },
          { name: '强烈阴影', shadow: ShadowRenderer.createStrongShadow() },
          { name: '内阴影', shadow: ShadowRenderer.createInsetShadow() }
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              {item.name}
            </h4>
            <div 
              className="w-full h-32 rounded bg-white dark:bg-gray-800 flex items-center justify-center"
              style={{ boxShadow: ShadowRenderer.getCSSShadow(item.shadow) }}
            >
              <span className="text-gray-600 dark:text-gray-400">阴影效果</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">彩色阴影</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { color: 'red', name: '红色阴影' },
            { color: 'blue', name: '蓝色阴影' },
            { color: 'green', name: '绿色阴影' }
          ].map((item, index) => {
            const shadow = ShadowRenderer.createColoredShadow(item.color);
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h5 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {item.name}
                </h5>
                <div 
                  className="w-full h-24 rounded bg-white dark:bg-gray-800 flex items-center justify-center"
                  style={{ boxShadow: ShadowRenderer.getCSSShadow(shadow) }}
                >
                  <span className="text-gray-600 dark:text-gray-400">彩色阴影</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

    // 图案演示
  const renderPatternsDemo = () => {
    // 创建简单的内联SVG图案
    const createSimplePattern = (type: string, size: number = 10) => {
      switch (type) {
        case 'dots':
          const dotsId = `dots-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="200" height="120" className="w-full h-full">
              <defs>
                <pattern id={dotsId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
                  <circle cx={size/2} cy={size/2} r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="200" height="120" fill={`url(#${dotsId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        case 'lines':
          const linesId = `lines-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="200" height="120" className="w-full h-full">
              <defs>
                <pattern id={linesId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
                  <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="200" height="120" fill={`url(#${linesId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        case 'grid':
          const gridId = `grid-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="200" height="120" className="w-full h-full">
              <defs>
                <pattern id={gridId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
                  <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="currentColor" strokeWidth="0.5" />
                  <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="200" height="120" fill={`url(#${gridId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        case 'diagonal':
          const diagonalId = `diagonal-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="200" height="120" className="w-full h-full">
              <defs>
                <pattern id={diagonalId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2={size} y2={size} stroke="currentColor" strokeWidth="1" />
                  <line x1={size} y1="0" x2="0" y2={size} stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="200" height="120" fill={`url(#${diagonalId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        case 'waves':
          const wavesId = `waves-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="150" height="90" className="w-full h-full">
              <defs>
                <pattern id={wavesId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 0,10 Q 5,5 10,10 T 20,10" stroke="currentColor" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="150" height="90" fill={`url(#${wavesId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        case 'stars':
          const starsId = `stars-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="150" height="90" className="w-full h-full">
              <defs>
                <pattern id={starsId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="150" height="90" fill={`url(#${starsId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        case 'hexagon':
          const hexagonId = `hexagon-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <svg width="150" height="90" className="w-full h-full">
              <defs>
                <pattern id={hexagonId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <polygon points="10,2 16,6 16,14 10,18 4,14 4,6" stroke="currentColor" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="150" height="90" fill={`url(#${hexagonId})`} className="text-gray-800 dark:text-gray-200" />
            </svg>
          );
        default:
          return <div>未知图案</div>;
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">图案填充演示</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: '点状图案', type: 'dots' },
            { name: '线条图案', type: 'lines' },
            { name: '网格图案', type: 'grid' },
            { name: '斜线图案', type: 'diagonal' }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                {item.name}
              </h4>
              <div className="w-full h-32 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {createSimplePattern(item.type)}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">特殊图案</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: '波浪图案', type: 'waves' },
              { name: '星星图案', type: 'stars' },
              { name: '六边形图案', type: 'hexagon' }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h5 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {item.name}
                </h5>
                <div className="w-full h-24 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {createSimplePattern(item.type)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            TikZ 功能增强演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            展示新实现的颜色系统、渐变、阴影和图案填充功能
          </p>
        </div>

        {/* 功能选择标签 */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { key: 'colors', name: '颜色系统', icon: '🎨' },
            { key: 'gradients', name: '渐变效果', icon: '🌈' },
            { key: 'shadows', name: '阴影效果', icon: '🌗' },
            { key: 'patterns', name: '图案填充', icon: '🔲' }
          ].map((feature) => (
            <motion.button
              key={feature.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFeature(feature.key as any)}
              className={`px-6 py-3 mx-2 mb-2 rounded-lg font-medium transition-colors ${
                selectedFeature === feature.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{feature.icon}</span>
              {feature.name}
            </motion.button>
          ))}
        </div>

        {/* 功能演示区域 */}
        <motion.div
          key={selectedFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          {selectedFeature === 'colors' && renderColorsDemo()}
          {selectedFeature === 'gradients' && renderGradientsDemo()}
          {selectedFeature === 'shadows' && renderShadowsDemo()}
          {selectedFeature === 'patterns' && renderPatternsDemo()}
        </motion.div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            使用说明
          </h3>
          <div className="text-blue-700 dark:text-blue-300 space-y-2">
            <p>• <strong>颜色系统</strong>: 支持RGB、HEX、CMYK、灰度等多种颜色格式，支持颜色混合和调整</p>
            <p>• <strong>渐变效果</strong>: 支持线性、径向渐变，提供预定义的渐变样式</p>
            <p>• <strong>阴影效果</strong>: 支持多种阴影类型，可自定义偏移、模糊、颜色等参数</p>
            <p>• <strong>图案填充</strong>: 支持点状、线条、网格、波浪等多种图案样式</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikZFeaturesDemo;
