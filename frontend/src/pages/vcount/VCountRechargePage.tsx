import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { vcountAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

const VCountRechargePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showErrorRightSlide, rightSlideModal, closeRightSlide } = useModal();
  
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // 预设充值金额选项
  const presetAmounts = [10, 50, 100, 200, 500, 1000];

  // 加载当前余额
  const loadCurrentBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await vcountAPI.getBalance();
      if (response.data.success) {
        setCurrentBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error('加载余额失败:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadCurrentBalance();
  }, []);

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showErrorRightSlide(t('vcount.errors.invalidAmount'), '');
      return;
    }

    if (parseFloat(amount) > 10000) {
      showErrorRightSlide(t('vcount.errors.amountTooLarge'), '');
      return;
    }

    // TODO: 支付方式绑定检查
    // 检查用户是否已绑定支付方式
    const hasPaymentMethod = await checkPaymentMethod();
    if (!hasPaymentMethod) {
      showErrorRightSlide(t('vcount.errors.noPaymentMethod'), t('vcount.errors.noPaymentMethodDesc'));
      return;
    }

    // 暂时显示开发中提示
    showErrorRightSlide(t('vcount.errors.systemNotReady'), t('vcount.errors.systemNotReadyDesc'));
    return;

    // 以下代码将在支付系统开发完成后启用
    /*
    try {
      setIsLoading(true);
      const response = await vcountAPI.recharge({
        amount: parseFloat(amount),
        description: description || t('vcount.defaultDescription')
      });

      if (response.data.success) {
        showSuccessRightSlide(t('vcount.success.rechargeSuccess'), '');
        setAmount('');
        setDescription('');
        await loadCurrentBalance();
      }
    } catch (error: any) {
      console.error('充值失败:', error);
      showErrorRightSlide(error.response?.data?.error || t('vcount.errors.rechargeFailed'), '');
    } finally {
      setIsLoading(false);
    }
    */
  };

  // 检查支付方式绑定状态 - 接口预留
  const checkPaymentMethod = async (): Promise<boolean> => {
    try {
      // TODO: 实现支付方式检查API
      // const response = await vcountAPI.checkPaymentMethod();
      // return response.data.hasPaymentMethod;
      
      // 暂时返回false，表示未绑定支付方式
      return false;
    } catch (error) {
      console.error('检查支付方式失败:', error);
      return false;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-2xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('vcount.recharge.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('vcount.recharge.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 当前余额卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-2">
                    {t('vcount.currentBalance')}
                  </h2>
                  {isLoadingBalance ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span className="text-white/80">{t('common.loading')}</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">
                      {currentBalance.toFixed(2)} V
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 充值表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t('vcount.recharge.formTitle')}
                </h3>
              </div>

              {/* 预设金额选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('vcount.recharge.presetAmounts')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((presetAmount) => (
                    <motion.button
                      key={presetAmount}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePresetAmount(presetAmount)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        amount === presetAmount.toString()
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{presetAmount}</div>
                      <div className="text-xs opacity-75">V</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 自定义金额输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('vcount.recharge.customAmount')}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t('vcount.recharge.amountPlaceholder')}
                    className="pl-12"
                    min="0.01"
                    max="10000"
                    step="0.01"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    V
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('vcount.recharge.amountHint')}
                </p>
              </div>

              {/* 充值说明 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('vcount.recharge.description')}
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('vcount.recharge.descriptionPlaceholder')}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description.length}/200 {t('common.characters')}
                </p>
              </div>

              {/* 充值说明 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">{t('vcount.recharge.noteTitle')}</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {t('vcount.recharge.note1')}</li>
                      <li>• {t('vcount.recharge.note2')}</li>
                      <li>• {t('vcount.recharge.note3')}</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* 充值按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleRecharge}
                  disabled={isLoading || !amount || parseFloat(amount) <= 0}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {t('vcount.recharge.processing')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {t('vcount.recharge.confirmRecharge')}
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* 安全提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {t('vcount.recharge.securityTitle')}
                  </p>
                  <p>{t('vcount.recharge.securityNote')}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 右侧弹窗 */}
      <RightSlideModal
        isOpen={rightSlideModal.isOpen}
        onClose={closeRightSlide}
        title={rightSlideModal.title}
        message={rightSlideModal.message}
        type={rightSlideModal.type}
        width={rightSlideModal.width}
        autoClose={rightSlideModal.autoClose}
        showProgress={rightSlideModal.showProgress}
      />
    </div>
  );
};

export default VCountRechargePage;
