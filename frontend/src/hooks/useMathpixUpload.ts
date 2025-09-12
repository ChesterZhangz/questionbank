import { useState } from 'react';
import { recognizeImage, processPDF, processWord } from '../services/mathpixService';
import { useTranslation } from './useTranslation';

interface UseMathpixUploadOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const useMathpixUpload = (options?: UseMathpixUploadOptions) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const { t } = useTranslation();

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await recognizeImage(file);
      setResult(response);
      options?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || t('hooks.mathpixUpload.errors.imageRecognitionFailed');
      setError(errorMessage);
      console.error(t('hooks.mathpixUpload.console.imageRecognitionFailed'), errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 处理PDF上传
  const handlePDFUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await processPDF(file);
      setResult(response);
      options?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || t('hooks.mathpixUpload.errors.pdfProcessingFailed');
      setError(errorMessage);
      console.error(t('hooks.mathpixUpload.console.pdfProcessingFailed'), errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 处理Word上传
  const handleWordUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await processWord(file);
      setResult(response);
      options?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || t('hooks.mathpixUpload.errors.wordProcessingFailed');
      setError(errorMessage);
      console.error(t('hooks.mathpixUpload.console.wordProcessingFailed'), errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 根据文件类型自动选择处理方法
  const handleFileUpload = async (file: File) => {
    const fileType = file.type;
    
    if (fileType.includes('image')) {
      return handleImageUpload(file);
    } else if (fileType.includes('pdf')) {
      return handlePDFUpload(file);
    } else if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('doc')) {
      return handleWordUpload(file);
    } else {
      const errorMessage = t('hooks.mathpixUpload.errors.unsupportedFileType');
      setError(errorMessage);
      console.error(t('hooks.mathpixUpload.console.unsupportedFileType'));
      throw new Error(errorMessage);
    }
  };

  return {
    isLoading,
    result,
    error,
    handleImageUpload,
    handlePDFUpload,
    handleWordUpload,
    handleFileUpload,
  };
};