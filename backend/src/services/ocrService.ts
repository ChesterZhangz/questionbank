import crypto from 'crypto';
import axios from 'axios';

// 使用腾讯云官方SDK
const tencentcloud = require("tencentcloud-sdk-nodejs-ocr");
const OcrClient = tencentcloud.ocr.v20181119.Client;

import { correctLatexWithDeepSeek, recognizeChoiceQuestionWithDeepSeek } from './deepseekAI';

interface OCRResult {
  latex: string;
  confidence: number;
  isChoiceQuestion?: boolean;
  questionContent?: string;
  options?: string[];
}

interface TencentOCRResponse {
  RequestId: string;
  QuestionInfo?: Array<{
    Angle: number;
    Height: number;
    ImageBase64: string;
    OrgHeight: number;
    OrgWidth: number;
    ResultList: Array<{
      Answer: any[];
      Figure: any[];
      Option: Array<{
        Coord: any;
        GroupType: string;
        Index: number;
        ResultList: any;
        Text: string;
      }>;
      Question: Array<{
        Coord: any;
        GroupType: string;
        Index: number;
        ResultList: any;
        Text: string;
      }>;
      Table: any[];
    }>;
    Width: number;
  }>;
  TextDetections?: Array<{
    DetectedText: string;
    Confidence: number;
  }>;
}

// 获取环境变量的函数
function getOCRConfig() {
  const secretId = process.env.TENCENT_CLOUD_SECRET_ID;
  const secretKey = process.env.TENCENT_CLOUD_SECRET_KEY;
  
  return { secretId, secretKey };
}

// 创建腾讯云OCR客户端
function createOCRClient() {
  const { secretId, secretKey } = getOCRConfig();
  
  if (!secretId || !secretKey) {
    throw new Error('腾讯云OCR配置缺失');
  }

  const clientConfig = {
    credential: {
      secretId: secretId,
      secretKey: secretKey,
    },
    region: "ap-guangzhou",
    profile: {
      httpProfile: {
        endpoint: "ocr.tencentcloudapi.com",
      },
    },
  };

  return new OcrClient(clientConfig);
}

// 将图片buffer转换为base64
function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

// 使用腾讯云SDK调用OCR API
async function callTencentOCR(imageBase64: string): Promise<TencentOCRResponse> {
  try {
    const client = createOCRClient();
    
    // 使用QuestionOCR进行数学公式识别
    const params = {
      ImageBase64: imageBase64
    };
    const response = await client.QuestionOCR(params);
    
    return response;
  } catch (error: any) {
    console.error('腾讯云OCR API调用失败:');
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

    const ocrResponse = await callTencentOCR(imageBase64);
    const resp = ocrResponse; // 直接使用response，不需要.Response
    
    // 检查是否有TextDetections字段（通用OCR结果）
    if (resp.TextDetections && resp.TextDetections.length > 0) {
      for (let i = 0; i < resp.TextDetections.length; i++) {
        const detection = resp.TextDetections[i];
      }
    }

    let recognizedText = '';
    let optionText = '';
    let answerText = '';
    let confidence = 0.9; // 默认置信度

    // 从OCR响应中提取文本内容 - 增强版本，确保提取所有区域的内容
    if (resp.QuestionInfo && resp.QuestionInfo.length > 0) {
      
      for (let qIndex = 0; qIndex < resp.QuestionInfo.length; qIndex++) {
        const questionInfo = resp.QuestionInfo[qIndex];
        
        if (questionInfo.ResultList && questionInfo.ResultList.length > 0) {
          
          for (let rIndex = 0; rIndex < questionInfo.ResultList.length; rIndex++) {
            const result = questionInfo.ResultList[rIndex];
            
            // 提取题目内容
            if (result.Question && result.Question.length > 0) {
              for (const question of result.Question) {
                if (question.Text) {
                  recognizedText += question.Text + ' '; // 使用空格连接，避免换行造成的分割
                }
                
                // 递归提取嵌套的ResultList中的小问
                if (question.ResultList && question.ResultList.length > 0) {
                  for (let subIndex = 0; subIndex < question.ResultList.length; subIndex++) {
                    const subResult = question.ResultList[subIndex];
                    
                    if (subResult.Question && subResult.Question.length > 0) {
                      for (const subQuestion of subResult.Question) {
                        if (subQuestion.Text) {
                          recognizedText += subQuestion.Text + ' '; // 添加小问内容
                        }
                      }
                    }
                  }
                }
              }
            }
            
            // 提取选项内容
            if (result.Option && result.Option.length > 0) {
              console.log(`发现 ${result.Option.length} 个选项片段`);
              for (const option of result.Option) {
                if (option.Text) {
                  console.log(`选项文本: "${option.Text}"`);
                  optionText += option.Text + ' '; // 使用空格连接
                }
              }
            }
            
            // 提取答案内容
            if (result.Answer && result.Answer.length > 0) {
              console.log(`发现 ${result.Answer.length} 个答案片段`);
              for (const answer of result.Answer) {
                if (answer.Text) {
                  console.log(`答案文本: "${answer.Text}"`);
                  answerText += answer.Text + ' '; // 使用空格连接
                }
              }
            }
          }
        } else {
          console.log(`QuestionInfo[${qIndex}] 没有ResultList或为空`);
        }
      }
    } else {
      console.log('=== 没有发现QuestionInfo或为空 ===');
    }

    // 合并所有内容
    let finalText = recognizedText.trim();
    if (optionText.trim()) finalText += '\n' + optionText.trim();
    if (answerText.trim()) finalText += '\n' + answerText.trim();

    console.log('QuestionInfo提取的文本:', finalText);
    
    // 如果QuestionInfo提取的内容太少，尝试使用TextDetections作为备选
    if (finalText.length < 20 && resp.TextDetections && resp.TextDetections.length > 0) {
      console.log('=== QuestionInfo提取内容过少，使用TextDetections作为备选 ===');
      const allDetectedText = resp.TextDetections
        .map(detection => detection.DetectedText)
        .join(' ');
      console.log('TextDetections合并文本:', allDetectedText);
      
      if (allDetectedText.length > finalText.length) {
        finalText = allDetectedText;
        console.log('使用TextDetections结果替换QuestionInfo结果');
      }
    }

    console.log('最终提取的文本:', finalText);

    if (!finalText) {
      throw new Error('未识别到任何题目内容');
    }

    // 转换为LaTeX格式
    const latex = convertTextToLatex(finalText);
    console.log('正则转换后的LaTeX:', latex);

    // DeepSeek AI矫正（可选）
    let finalLatex = latex;
    if (process.env.ENABLE_DEEPSEEK_AI_CORRECTION === 'true') {
      try {
        finalLatex = await correctLatexWithDeepSeek(latex);
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
  const { secretId, secretKey } = getOCRConfig();
  return !!(secretId && secretKey);
} 