import React from 'react';
import { 
  Info, 
  HelpCircle,
  Settings
} from 'lucide-react';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import RightSlideModal from './RightSlideModal';
import { useModal } from '../../hooks/useModal';

const ModalExamples: React.FC = () => {
  const {
    confirmModal,
    showConfirm,
    showWarning,
    showDanger,
    showInfo,
    showSuccess,
    closeConfirm,
    rightSlideModal,
    showRightSlide,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  } = useModal();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            弹窗组件示例
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            专业的弹窗组件，完美支持DarkMode，替代原生confirm和alert
          </p>
        </div>

        {/* 确认弹窗示例 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue-500" />
            确认弹窗 (ConfirmModal)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            用于替代 window.confirm，支持多种类型和自定义配置
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => showConfirm(
                '确认操作',
                '您确定要执行此操作吗？',
                () => console.log('用户确认了操作'),
                { type: 'confirm' }
              )}
              className="w-full"
            >
              基础确认
            </Button>

            <Button
              onClick={() => showWarning(
                '警告提示',
                '此操作可能会影响系统性能，请谨慎操作。',
                () => console.log('用户确认了警告操作')
              )}
              variant="outline"
              className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              警告确认
            </Button>

            <Button
              onClick={() => showDanger(
                '危险操作',
                '此操作不可逆，删除后无法恢复，确定要继续吗？',
                () => console.log('用户确认了危险操作')
              )}
              variant="outline"
              className="w-full border-red-500 text-red-600 hover:bg-red-50"
            >
              危险确认
            </Button>

            <Button
              onClick={() => showInfo(
                '信息提示',
                '这是一个信息提示弹窗，用于显示重要信息。'
              )}
              variant="outline"
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              信息提示
            </Button>

            <Button
              onClick={() => showSuccess(
                '操作成功',
                '您的操作已成功完成！'
              )}
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
            >
              成功提示
            </Button>

            <Button
              onClick={() => showConfirm(
                '自定义弹窗',
                '这是一个自定义宽度和样式的弹窗示例。',
                () => console.log('自定义弹窗确认'),
                { 
                  width: 'xl',
                  confirmText: '我知道了',
                  cancelText: '稍后再说'
                }
              )}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              自定义样式
            </Button>
          </div>
        </div>

        {/* 右侧弹窗示例 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-500" />
            右上角弹窗 (RightSlideModal)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            精致优雅的右上角小弹窗，支持自动关闭和进度条，替代原生 alert
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => showRightSlide(
                '信息提示',
                '这是一个精致的信息提示弹窗，显示在右上角。'
              )}
              variant="outline"
              className="w-full"
            >
              基础信息
            </Button>

            <Button
              onClick={() => showSuccessRightSlide(
                '操作成功',
                '您的操作已成功完成！精致弹窗将在1.5秒后自动关闭。'
              )}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              成功提示
            </Button>

            <Button
              onClick={() => showErrorRightSlide(
                '操作失败',
                '抱歉，操作失败了。请检查网络连接后重试。精致弹窗将在2.5秒后自动关闭。'
              )}
              variant="outline"
              className="w-full border-red-500 text-red-600 hover:bg-red-50"
            >
              错误提示
            </Button>

            <Button
              onClick={() => showRightSlide(
                '自定义弹窗',
                '这是一个自定义宽度和样式的右上角弹窗示例。',
                { 
                  width: 'lg',
                  type: 'warning',
                  autoClose: 8000,
                  showProgress: true
                }
              )}
              variant="outline"
              className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              自定义样式
            </Button>

            <Button
              onClick={() => showRightSlide(
                '无自动关闭',
                '这个弹窗不会自动关闭，需要手动关闭。',
                { 
                  autoClose: 0,
                  showProgress: false
                }
              )}
              variant="outline"
              className="w-full border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              手动关闭
            </Button>

            <Button
              onClick={() => showRightSlide(
                '带确认按钮',
                '这个弹窗包含确认按钮，点击确认后会执行相应操作。',
                { 
                  onConfirm: () => console.log('用户点击了确认按钮')
                }
              )}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              带确认按钮
            </Button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 p-8">
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6 flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-500" />
            使用说明
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                ConfirmModal 特性
              </h3>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>• 支持多种类型：confirm、warning、danger、info、success</li>
                <li>• 完美支持DarkMode</li>
                <li>• 可自定义按钮文字和样式</li>
                <li>• 支持不同宽度：sm、md、lg、xl</li>
                <li>• 可阻止点击背景关闭</li>
                <li>• 流畅的动画效果</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                RightSlideModal 特性
              </h3>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>• 精致优雅的右上角小弹窗，高斯模糊背景</li>
                <li>• 快速自动关闭（成功1.5秒，错误2.5秒）</li>
                <li>• 内部进度条，渐变色彩设计</li>
                <li>• 多种类型：success、warning、error、info、confirm</li>
                <li>• 可自定义宽度和关闭时间</li>
                <li>• 完美支持DarkMode，现代化UI设计</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />

      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default ModalExamples;
