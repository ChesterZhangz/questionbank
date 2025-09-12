import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { paperBankAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const PaperBankAcceptInvitationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading');
  const [message, setMessage] = useState('');
  const [paperBankName, setPaperBankName] = useState('');

  const email = searchParams.get('email');
  const role = searchParams.get('role');
  const paperBankId = window.location.pathname.split('/')[2]; // 从URL路径中提取试卷集ID

  useEffect(() => {
    if (!isAuthenticated) {
      // 如果用户未登录，重定向到登录页面，并保存当前URL以便登录后返回
      const currentUrl = window.location.href;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (!email || !role || !paperBankId) {
      setStatus('error');
      setMessage(t('paperBanks.invitation.messages.invalidLink'));
      return;
    }

    handleAcceptInvitation();
  }, [isAuthenticated, email, role, paperBankId, navigate, t]);

  const handleAcceptInvitation = async () => {
    try {
      setStatus('processing');
      
      // 首先获取试卷集信息
      const paperBankResponse = await paperBankAPI.getPaperBank(paperBankId);
      if (paperBankResponse.data.success) {
        setPaperBankName(paperBankResponse.data.data.name);
      }

      // 接受邀请
      const response = await paperBankAPI.acceptPaperBankInvitation(paperBankId, {
        email: email!,
        role: role!
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(t('paperBanks.invitation.messages.acceptSuccess', { name: paperBankName || '试卷集' }));
      } else {
        setStatus('error');
        setMessage(response.data.message || t('paperBanks.invitation.messages.acceptFailed'));
      }
    } catch (error: any) {
      console.error('接受邀请失败:', error);
      setStatus('error');
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage(t('paperBanks.invitation.messages.acceptFailed'));
      }
    }
  };

  const handleGoToPaperBank = () => {
    navigate(`/paper-banks/${paperBankId}`);
  };

  const handleGoToPaperBanks = () => {
    navigate('/paper-banks');
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'loading':
      case 'processing':
        return <Loader className="w-16 h-16 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-600" />;
    }
  };

  const renderStatusMessage = () => {
    switch (status) {
      case 'loading':
        return t('paperBanks.invitation.messages.loading');
      case 'processing':
        return t('paperBanks.invitation.messages.processing');
      case 'success':
        return (
          <div className="text-center">
            <p className="text-lg text-green-600 mb-4">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={handleGoToPaperBank}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                {t('paperBanks.invitation.actions.viewPaperBank')}
              </Button>
              <Button
                onClick={handleGoToPaperBanks}
                variant="outline"
                className="w-full"
              >
                {t('paperBanks.invitation.actions.viewAllPaperBanks')}
              </Button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{message}</p>
            <Button
              onClick={handleGoToPaperBanks}
              variant="outline"
              className="w-full"
            >
              {t('paperBanks.invitation.actions.backToPaperBanks')}
            </Button>
          </div>
        );
      default:
        return message;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="mb-6">
            {renderStatusIcon()}
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('paperBanks.invitation.title')}
            </h1>
            {paperBankName && (
              <p className="text-gray-600 dark:text-gray-400">
                {t('paperBanks.invitation.subtitle', { name: paperBankName })}
              </p>
            )}
          </div>

          <div className="mb-6">
            {renderStatusMessage()}
          </div>

          {status === 'loading' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{t('paperBanks.invitation.messages.pleaseWait')}</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default PaperBankAcceptInvitationPage;
