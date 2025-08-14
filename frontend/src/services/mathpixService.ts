import api from './api';

// 图片识别
export const recognizeImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/mathpix/recognize-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// 批量图片识别
export const recognizeImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  
  const response = await api.post('/mathpix/recognize-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// PDF文档处理
export const processPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  const response = await api.post('/mathpix/process-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Word文档处理
export const processWord = async (file: File) => {
  const formData = new FormData();
  formData.append('word', file);
  
  const response = await api.post('/mathpix/process-word', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// 验证Mathpix API配置
export const validateMathpixConfig = async () => {
  const response = await api.get('/mathpix/validate-config');
  return response.data;
};