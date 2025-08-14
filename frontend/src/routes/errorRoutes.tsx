
import React from 'react';
import { Route } from 'react-router-dom';
import BadRequestPage from '../pages/errors/400Page';
import ForbiddenPage from '../pages/errors/403Page';
import NotFoundPage from '../pages/errors/404Page';
import ServerErrorPage from '../pages/errors/500Page';
import ErrorDemoPage from '../pages/errors/ErrorDemoPage';

const ErrorRoutes: React.FC = () => {
  return (
    <>
      <Route path="/400" element={<BadRequestPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/error-demo" element={<ErrorDemoPage />} />
    </>
  );
};

export default ErrorRoutes; 