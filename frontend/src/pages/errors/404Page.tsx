import React from 'react';
import ErrorPage from './ErrorPage';

const NotFoundPage: React.FC = () => {
  return (
    <ErrorPage
      errorCode="404"
      title="页面未找到"
      message="抱歉，您访问的页面不存在或已被移除."
      description="请检查URL是否正确，或者返回首页继续浏览."
      showGames={true}
      showNavigation={true}
    />
  );
};

export default NotFoundPage; 