// 中文语言包
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

export const zhCN = {
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
  
  // 语言信息
  language: {
    code: 'zh-CN',
    name: '中文',
    nativeName: '简体中文',
    direction: 'ltr'
  },
  
  // 日期格式
  dateFormat: 'YYYY年MM月DD日',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'YYYY年MM月DD日 HH:mm:ss',
  
  // 数字格式
  numberFormat: {
    decimal: '.',
    thousands: ',',
    currency: '¥'
  }
};
