import React from 'react';
import ErrorPage from './ErrorPage';
import { useTranslation } from '../../hooks/useTranslation';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <ErrorPage
      errorCode="404"
      title={t('errors.notFound.title')}
      message={t('errors.notFound.message')}
      description={t('errors.notFound.description')}
      showGames={true}
      showNavigation={true}
    />
  );
};

export default NotFoundPage; 