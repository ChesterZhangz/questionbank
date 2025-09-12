import React from 'react';
import ErrorPage from './ErrorPage';
import { useTranslation } from '../../hooks/useTranslation';

const ServerErrorPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <ErrorPage
      errorCode="500"
      title={t('errors.serverError.title')}
      message={t('errors.serverError.message')}
      description={t('errors.serverError.description')}
      showGames={true}
      showNavigation={true}
    />
  );
};

export default ServerErrorPage; 