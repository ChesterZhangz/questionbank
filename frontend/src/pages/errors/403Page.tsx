import React from 'react';
import ErrorPage from './ErrorPage';

const ForbiddenPage: React.FC = () => {
  return (
    <ErrorPage
      errorCode="403"
      title="访问被拒绝"
      message="抱歉，您没有权限访问此页面。"
      description="请确认您已登录并具有相应的访问权限，或联系管理员获取帮助。"
      showGames={true}
      showNavigation={true}
    />
  );
};

export default ForbiddenPage; 