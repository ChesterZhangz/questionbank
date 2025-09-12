import React from 'react';
import ErrorPage from './ErrorPage';
import { useTranslation } from '../../hooks/useTranslation';

const BadRequestPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <ErrorPage
      errorCode="400"
      title={t('errors.badRequest.title')}
      message={t('errors.badRequest.message')}
      description={t('errors.badRequest.description')}
      showGames={true}
      showNavigation={true}
    />
  );
};

export default BadRequestPage; 