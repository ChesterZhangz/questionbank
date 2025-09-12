import React from 'react';
import ErrorPage from './ErrorPage';
import { useTranslation } from '../../hooks/useTranslation';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <ErrorPage
      errorCode="403"
      title={t('errors.forbidden.title')}
      message={t('errors.forbidden.message')}
      description={t('errors.forbidden.description')}
      showGames={true}
      showNavigation={true}
    />
  );
};

export default ForbiddenPage; 