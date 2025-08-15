import axios from 'axios';

import { correctLatexWithDeepSeek, recognizeChoiceQuestionWithDeepSeek } from './deepseekAI';

interface OCRResult {
  latex: string;
  confidence: number;
  isChoiceQuestion?: boolean;
  questionContent?: string;
  options?: string[];
}

interface MathpixOCRResponse {
  text: string;
  confidence: number;
  latex?: string;
  html?: string;
  error?: string;
}

// 获取Mathpix配置
function getMathpixConfig() {
  const apiKey = process.env.MATHPIX_API_KEY;
  const appId = process.env.MATHPIX_APP_ID || 'mareate_internal';
  
  return { apiKey, appId };
}

// 将图片buffer转换为base64
function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

// 使用Mathpix API调用OCR API
async function callMathpixOCR(imageBase64: string): Promise<MathpixOCRResponse> {
  try {
    const { apiKey, appId } = getMathpixConfig();
    
    if (!apiKey || !appId) {
      throw new Error('Mathpix API配置缺失');
    }

    const requestBody = {
      src: `data:image/jpeg;base64,${imageBase64}`,
      formats: ['text', 'latex_styled']
    };

    const response = await axios.post('https://api.mathpix.com/v3/text', requestBody, {
      headers: {
        'app_id': appId,
        'app_key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });

    if (response.data.error) {
      throw new Error(`Mathpix API错误: ${response.data.error}`);
    }

    return {
      text: response.data.text || '',
      confidence: response.data.confidence || 0.8,
      latex: response.data.latex_styled || '',
      html: response.data.html || ''
    };
  } catch (error: any) {
    console.error('Mathpix OCR API调用失败:');
    console.error('错误详情:', error);
    console.error('错误消息:', error.message);
    throw error;
  }
}

// 将OCR文本转换为LaTeX
export function convertTextToLatex(text: string): string {
  let latex = text.replace(/\$/g, '');
  latex = latex.replace(/\s+/g, ' ').trim();
  return latex;
}

// 主要的OCR识别函数
export async function recognizeImage(imageBuffer: Buffer): Promise<OCRResult> {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('图片数据为空');
    }
    const imageBase64 = bufferToBase64(imageBuffer);

    console.log('开始调用Mathpix OCR API...');
    const ocrResponse = await callMathpixOCR(imageBase64);
    
    if (!ocrResponse.text || ocrResponse.text.trim().length === 0) {
      throw new Error('Mathpix未识别到任何文本内容');
    }

    console.log('Mathpix识别的原始文本:', ocrResponse.text);

    // 使用Mathpix识别的文本作为基础
    let finalText = ocrResponse.text.trim();
    const confidence = ocrResponse.confidence;

    // 转换为LaTeX格式
    const latex = convertTextToLatex(finalText);
    console.log('正则转换后的LaTeX:', latex);

    // DeepSeek AI矫正（可选）
    let finalLatex = latex;
    if (process.env.ENABLE_DEEPSEEK_AI_CORRECTION === 'true') {
      try {
        console.log('开始DeepSeek AI矫正...');
        finalLatex = await correctLatexWithDeepSeek(latex);
        console.log('DeepSeek AI矫正完成');
      } catch (error) {
        console.log('DeepSeek AI矫正失败，使用正则转换结果:', error);
        finalLatex = latex;
      }
    } else {
      console.log('DeepSeek AI矫正未启用，使用正则转换结果');
    }

    // 选择题识别（在AI矫正后进行）
    let choiceResult = {
      isChoiceQuestion: false,
      questionContent: finalLatex,
      options: [] as string[]
    };

    try {
      console.log('开始选择题识别...');
      choiceResult = await recognizeChoiceQuestionWithDeepSeek(finalLatex);
      console.log('选择题识别结果:', choiceResult);
    } catch (error) {
      console.log('选择题识别失败，使用默认结果:', error);
    }

    return {
      latex: finalLatex,
      confidence: confidence,
      isChoiceQuestion: choiceResult.isChoiceQuestion,
      questionContent: choiceResult.questionContent,
      options: choiceResult.options
    };
  } catch (error: any) {
    console.error('OCR识别失败:', error);
    const enhancedError = new Error(error.message);
    (enhancedError as any).code = 'OCR_FAILED';
    throw enhancedError;
  }
}

// 批量OCR识别
export async function recognizeImages(imageBuffers: Buffer[]): Promise<OCRResult[]> {
  const results = await Promise.all(
    imageBuffers.map(async (buffer, index) => {
      try {
        return await recognizeImage(buffer);
      } catch (error: any) {
        console.error(`第${index + 1}张图片OCR识别失败:`, error);
        throw error;
      }
    })
  );

  return results;
}

// 验证OCR服务配置
export function validateOCRConfig(): boolean {
  const { apiKey, appId } = getMathpixConfig();
  return !!(apiKey && appId);
} 