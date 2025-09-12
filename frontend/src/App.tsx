import React, { useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import RegisterSuccessPage from './pages/auth/RegisterSuccessPage';
import VersionPage from './pages/VersionPage';

// 懒加载大型页面组件
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const QuestionBankListPage = lazy(() => import('./pages/question-banks/QuestionBankListPage'));
const CreateQuestionBankPage = lazy(() => import('./pages/question-banks/CreateQuestionBankPage'));
const QuestionBankDetailPage = lazy(() => import('./pages/question-banks/QuestionBankDetailPage'));
const CreateQuestionPage = lazy(() => import('./pages/question-banks/CreateQuestionPage'));
const EditQuestionPage = lazy(() => import('./pages/question-banks/EditQuestionPage'));
const EditQuestionBankPage = lazy(() => import('./pages/question-banks/EditQuestionBankPage'));
const QuestionBankMembersPage = lazy(() => import('./pages/question-banks/QuestionBankMembersPage'));
const QuestionBankSettingsPage = lazy(() => import('./pages/question-banks/QuestionBankSettingsPage'));
const QuestionBankStatsPage = lazy(() => import('./pages/question-banks/QuestionBankStatsPage'));
const QuestionManagementPage = lazy(() => import('./pages/management/QuestionManagementPage'));
const BatchUploadPage = lazy(() => import('./pages/upload/BatchUploadPage'));
const QuestionPreviewPage = lazy(() => import('./pages/upload/QuestionPreviewPage'));
const UserManagementPage = lazy(() => import('./pages/management/UserManagementPage'));
const SettingsPage = lazy(() => import('./pages/profile/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const QuestionViewPage = lazy(() => import('./pages/view/QuestionViewPage'));
const MyEnterprisePage = lazy(() => import('./pages/my-enterprise/MyEnterprisePage'));
const EnterpriseManagementPage = lazy(() => import('./pages/enterprise-management/EnterpriseManagementPage'));
const LaTeXGuide = lazy(() => import('./pages/LaTeXGuide'));
const LaTeXMathGuide = lazy(() => import('./pages/guide/latex-math'));
const LaTeXQuestionsGuide = lazy(() => import('./pages/guide/latex-questions'));
const TikZBasicsGuide = lazy(() => import('./pages/guide/tikz-basics'));
const TikZFunctionsGuide = lazy(() => import('./pages/guide/tikz-functions'));
const TikZEffectsGuide = lazy(() => import('./pages/guide/tikz-effects'));
const PaperBankListPage = lazy(() => import('./pages/paper-banks/PaperBankListPage'));
const PaperBankDetailPage = lazy(() => import('./pages/paper-banks/PaperBankDetailPage'));
const CreatePaperBankPage = lazy(() => import('./pages/paper-banks/CreatePaperBankPage'));
const EditPaperBankPage = lazy(() => import('./pages/paper-banks/EditPaperBankPage'));
const PaperBankMembersPage = lazy(() => import('./pages/paper-banks/PaperBankMembersPage'));
const MyPapersPage = lazy(() => import('./pages/paper-banks/MyPapersPage'));
const CreatePaperPage = lazy(() => import('./pages/papers/CreatePaperPage'));
// 暂时禁用讲义功能
// const LectureEditorPage = lazy(() => import('./pages/lecture-editor/LectureEditorPage'));
const PracticePage = lazy(() => import('./pages/practice/PracticePage'));
const PracticeEditorPage = lazy(() => import('./pages/practice-editor/PracticeEditorPage'));
const PracticePaperViewPage = lazy(() => import('./components/paper/preview/PracticePaperViewPage'));
// const LaTeXTestDemo = lazy(() => import('./pages/LaTeXTestDemo'));




import { useAuthStore } from './stores/authStore';
import { BackgroundTaskProvider } from './contexts/BackgroundTaskContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// 错误处理组件
import ErrorBoundary from './components/errors/ErrorBoundary';
import NetworkErrorHandler from './components/errors/NetworkErrorHandler';
import { setupGlobalErrorHandler } from './utils/errorHandler';



// 错误页面
import { Page400, Page403, Page404, Page500 } from './pages/errors';
import ErrorDemoPage from './pages/errors/ErrorDemoPage';
import IntroductionPage from './pages/IntroductionPage';

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
            <LanguageProvider>
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

            {/* 试卷集管理路由 */}
            <Route 
              path="/paper-banks" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PaperBankListPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-papers" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MyPapersPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/papers/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreatePaperPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/paper-banks/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PaperBankDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route
              path="/paper-banks/create"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreatePaperBankPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
                <Route
                  path="/paper-banks/:id/edit"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EditPaperBankPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/paper-banks/:id/members"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PaperBankMembersPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

            {/* 讲义编辑器路由 - 暂时禁用 */}
            {/* <Route
              path="/paper-banks/:paperBankId/lectures/create"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LectureEditorPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/paper-banks/:paperBankId/lectures/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LectureEditorPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            /> */}

            {/* 练习模式路由 */}
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PracticePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/paper-banks/:paperBankId/practices/create"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PracticeEditorPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/paper-banks/:paperBankId/practices/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PracticeEditorPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/papers/:id/view"
              element={
                <ProtectedRoute>
                  <PracticePaperViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/latex-test-demo"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        LaTeX 测试演示
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        此功能暂时不可用
                      </p>
                    </div>
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
              path="/batch-upload/preview-edit/:draftId" 
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
                                <Route 
              path="/LaTeXGuide" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LaTeXGuide />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/guide/latex/math" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LaTeXMathGuide />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/guide/latex/questions" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LaTeXQuestionsGuide />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/guide/tikz/basics" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TikZBasicsGuide />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/guide/tikz/functions" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TikZFunctionsGuide />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/guide/tikz/effects" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TikZEffectsGuide />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<IntroductionPage />} />
            <Route path="/introduction" element={<IntroductionPage />} />

            
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
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
};

export default App;
