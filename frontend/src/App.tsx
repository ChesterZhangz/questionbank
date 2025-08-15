import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import RegisterSuccessPage from './pages/auth/RegisterSuccessPage';
import QuestionBankListPage from './pages/question-banks/QuestionBankListPage';
import CreateQuestionBankPage from './pages/question-banks/CreateQuestionBankPage';
import QuestionBankDetailPage from './pages/question-banks/QuestionBankDetailPage';
import CreateQuestionPage from './pages/question-banks/CreateQuestionPage';
import EditQuestionPage from './pages/question-banks/EditQuestionPage';
import EditQuestionBankPage from './pages/question-banks/EditQuestionBankPage';
import QuestionBankMembersPage from './pages/question-banks/QuestionBankMembersPage';
import QuestionBankSettingsPage from './pages/question-banks/QuestionBankSettingsPage';
import QuestionBankStatsPage from './pages/question-banks/QuestionBankStatsPage';
import QuestionManagementPage from './pages/management/QuestionManagementPage';
import BatchUploadPage from './pages/upload/BatchUploadPage';
import QuestionPreviewPage from './pages/upload/QuestionPreviewPage';

import PaperGenerationPage from './pages/generation/PaperGenerationPage';
import UserManagementPage from './pages/management/UserManagementPage';
import SettingsPage from './pages/profile/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import QuestionViewPage from './pages/view/QuestionViewPage';
import VersionPage from './pages/VersionPage';

// 企业相关页面
import MyEnterprisePage from './pages/my-enterprise/MyEnterprisePage';
import EnterpriseManagementPage from './pages/enterprise-management/EnterpriseManagementPage';
import { useAuthStore } from './stores/authStore';
import { BackgroundTaskProvider } from './contexts/BackgroundTaskContext';
import { ThemeProvider } from './contexts/ThemeContext';

// 错误处理组件
import ErrorBoundary from './components/errors/ErrorBoundary';
import NetworkErrorHandler from './components/errors/NetworkErrorHandler';
import { setupGlobalErrorHandler } from './utils/errorHandler';

// 错误页面
import { Page400, Page403, Page404, Page500 } from './pages/errors';
import ErrorDemoPage from './pages/errors/ErrorDemoPage';
import IntroductionPage from './pages/view/IntroductionPage';

// 样式文件
import './styles/theme.css';
import './styles/mobile.css';
import './styles/z-index.css';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 公共路由组件（已登录用户重定向到仪表板）
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { initialize } = useAuthStore();
  
  // 设置全局错误处理器
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  // 初始化认证状态
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <BackgroundTaskProvider>
              <Router>
                <div className="App min-h-screen bg-bg-primary dark:bg-gray-900">
              <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              } 
            />
            <Route path="/register-success" element={<RegisterSuccessPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionBankListPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateQuestionBankPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionBankDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid/questions/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateQuestionPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid/questions/:qid/edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditQuestionPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/:qid/view" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionViewPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/:qid/edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditQuestionPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid/edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditQuestionBankPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid/members" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionBankMembersPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionBankSettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks/:bid/stats" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionBankStatsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/questions" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/batch-upload" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BatchUploadPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
                              path="/batch-upload/preview-edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuestionPreviewPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/questions/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateQuestionPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />



            <Route 
              path="/paper-generation" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PaperGenerationPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/my-enterprise" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MyEnterprisePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/enterprise-management" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EnterpriseManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/version" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VersionPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 错误页面路由 */}
            <Route path="/error/400" element={<Page400 />} />
            <Route path="/error/403" element={<Page403 />} />
            <Route path="/error/404" element={<Page404 />} />
            <Route path="/error/500" element={<Page500 />} />
            <Route path="/error-demo" element={<ErrorDemoPage />} />
            <Route path="/introduction" element={<IntroductionPage />} />
            
            {/* 捕获所有未匹配的路由，显示404页面 */}
            <Route path="*" element={<Page404 />} />
          </Routes>
        </div>
      </Router>
            </BackgroundTaskProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
};

export default App;
