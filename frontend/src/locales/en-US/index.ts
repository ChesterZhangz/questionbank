// English language pack
import { common } from './common';
import { questionBank } from './questionBank';
import { settings } from './settings';
import { editor } from './editor';
import { errors } from './errors';
import { management } from './management';
import { games } from './games';
import { guide } from './guide';
import { layout } from './layout';
import { math } from './math';
import { paper } from './paper';
import { preview } from './preview';
import { question } from './question';
import { similarity } from './similarity';
import { social } from './social';
import { tikz } from './tikz';
import { ui } from './ui';
import { upload } from './upload';
import { config } from './config';
import { constants } from './constants';
import { contexts } from './contexts';
import { hooks } from './hooks';
import { lib } from './lib';
import { tikzSymbols } from './tikzSymbols';
import { auth } from './auth';
import { dashboard } from './dashboard';
import { enterpriseManagement } from './enterpriseManagement';
import { myEnterprise } from './myEnterprise';
import { paperBanks } from './paperBanks';
import paperPage from './paperPage';
import practiceEditor from './practiceEditor';
import profile from './profile';
import { questionBankPage } from './questionBankPage';
import { introduction } from './introduction';

export const enUS = {
  common,
  questionBank,
  settings,
  editor,
  errors,
  management,
  games,
  guide,
  layout,
  math,
  paper,
  preview,
  question,
  similarity,
  social,
  tikz,
  ui,
  upload,
  config,
  constants,
  contexts,
  hooks,
  lib,
  tikzSymbols,
  auth,
  dashboard,
  enterpriseManagement,
  myEnterprise,
  paperBanks,
  paperPage,
  practiceEditor,
  profile,
  questionBankPage,
  introduction,
  
  // Language information
  language: {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr'
  },
  
  // Date formats
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'MM/DD/YYYY HH:mm:ss',
  
  // Number formats
  numberFormat: {
    decimal: '.',
    thousands: ',',
    currency: '$'
  }
};
