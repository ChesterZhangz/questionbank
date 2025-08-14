import React from 'react';
import ErrorPage from './ErrorPage';

const ServerErrorPage: React.FC = () => {
  return (
    <ErrorPage
      errorCode="500"
      title="服务器内部错误"
      message="抱歉，服务器遇到了一个意外错误，无法完成您的请求。"
      description="我们的技术团队已经收到这个错误报告，正在努力修复。请稍后再试。"
      showGames={true}
      showNavigation={true}
    />
  );
};

export default ServerErrorPage; 