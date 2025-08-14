import React from 'react';
import ErrorPage from './ErrorPage';

const BadRequestPage: React.FC = () => {
  return (
    <ErrorPage
      errorCode="400"
      title="请求错误"
      message="抱歉，您的请求格式不正确或包含无效参数。"
      description="请检查您的请求内容，确保所有参数都正确，然后重试。"
      showGames={true}
      showNavigation={true}
    />
  );
};

export default BadRequestPage; 