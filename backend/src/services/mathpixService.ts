import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';



interface MathpixPDFResult {
  request_id: string;
  status: string;
  result?: {
    mmd: string;
  };
}

// 获取环境变量的函数
function getMathpixConfig() {
  const apiKey = process.env.MATHPIX_API_KEY;
  const appId = process.env.MATHPIX_APP_ID || 'mareate_internal';
  
  return { apiKey, appId };
}

// 验证Mathpix API配置
export function validateMathpixConfig(): boolean {
  const { apiKey, appId } = getMathpixConfig();
  return !!(apiKey && appId);
}

// 将图片buffer转换为base64




// 调用Mathpix PDF API处理PDF文档
async function callMathpixPDF(pdfBuffer: Buffer): Promise<string> {
  const { apiKey, appId } = getMathpixConfig();
  
  if (!apiKey || !appId) {
    throw new Error('Mathpix API配置缺失');
  }

  try {
    // 1. 上传PDF文件
    const formData = new FormData();
    formData.append('file', pdfBuffer, { filename: 'document.pdf' });
    
    const uploadResponse = await axios.post('https://api.mathpix.com/v3/pdf', 
      formData,
      {
        headers: {
          'app_id': appId,
          'app_key': apiKey,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    console.log('PDF上传响应:', uploadResponse.data);
    
    const requestId = uploadResponse.data.pdf_id || uploadResponse.data.request_id;
    if (!requestId) {
      throw new Error(`PDF上传失败，未获取到request_id: ${JSON.stringify(uploadResponse.data)}`);
    }
    
    // 2. 轮询处理结果
    let result: MathpixPDFResult | null = null;
    let attempts = 0;
    const maxAttempts = 60; // 增加到60次尝试
    const pollInterval = 5000; // 增加到5秒间隔
    
    console.log(`开始处理PDF，请求ID: ${requestId}`);
    
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval)); // 等待5秒
      
      try {
        const statusResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${requestId}`, {
          headers: {
            'app_id': appId,
            'app_key': apiKey
          },
          timeout: 10000 // 10秒超时
        });
        
        result = statusResponse.data;
        
              if (result && result.status === 'completed') {
        console.log(`PDF处理完成，尝试次数: ${attempts}`);
        
        // 等待一段时间让结果准备好
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 尝试获取结果内容 - 根据Mathpix文档，可能需要使用不同的端点
        try {
          // 根据Mathpix文档，PDF处理完成后需要使用正确的方式获取结果
          console.log('PDF处理完成，开始获取结果...');
          
          // 根据文档，PDF结果可能需要通过不同的方式获取
          // 首先尝试获取转换结果
          try {
            console.log('尝试获取PDF转换结果...');
            
            // 方法1: 尝试获取.mmd格式的结果
            const mmdResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${requestId}.mmd`, {
              headers: {
                'app_id': appId,
                'app_key': apiKey
              },
              timeout: 10000
            });
            
            console.log('MMD结果获取成功');
            if (typeof mmdResponse.data === 'string') {
              return mmdResponse.data;
            } else if (mmdResponse.data.mmd) {
              return mmdResponse.data.mmd;
            }
          } catch (mmdError: any) {
            console.warn('获取MMD结果失败:', mmdError.message);
          }
          
          // 方法2: 尝试获取.txt格式的结果
          try {
            console.log('尝试获取PDF文本结果...');
            const txtResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${requestId}.txt`, {
              headers: {
                'app_id': appId,
                'app_key': apiKey
              },
              timeout: 10000
            });
            
            console.log('文本结果获取成功');
            if (typeof txtResponse.data === 'string') {
              return txtResponse.data;
            } else if (txtResponse.data.text) {
              return txtResponse.data.text;
            }
          } catch (txtError: any) {
            console.warn('获取文本结果失败:', txtError.message);
          }
          
          // 方法3: 尝试获取.html格式的结果
          try {
            console.log('尝试获取PDF HTML结果...');
            const htmlResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${requestId}.html`, {
              headers: {
                'app_id': appId,
                'app_key': apiKey
              },
              timeout: 10000
            });
            
            console.log('HTML结果获取成功');
            if (typeof htmlResponse.data === 'string') {
              return htmlResponse.data;
            } else if (htmlResponse.data.html) {
              return htmlResponse.data.html;
            }
          } catch (htmlError: any) {
            console.warn('获取HTML结果失败:', htmlError.message);
          }
          
          // 方法4: 尝试使用查询参数获取结果
          try {
            console.log('尝试使用查询参数获取结果...');
            const queryResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${requestId}`, {
              headers: {
                'app_id': appId,
                'app_key': apiKey
              },
              params: {
                format: 'mmd'
              },
              timeout: 10000
            });
            
            console.log('查询结果响应:', JSON.stringify(queryResponse.data, null, 2));
            
            if (queryResponse.data.mmd) {
              return queryResponse.data.mmd;
            }
            
            if (queryResponse.data.text) {
              return queryResponse.data.text;
            }
            
            if (queryResponse.data.html) {
              return queryResponse.data.html;
            }
          } catch (queryError: any) {
            console.warn('查询结果失败:', queryError.message);
          }
          
          console.warn('PDF处理完成但未找到MMD内容，返回空字符串');
          return '';
          
        } catch (resultError: any) {
          console.warn('获取PDF结果失败:', resultError.message);
          // 如果获取结果失败，返回空字符串
          return '';
        }
      } else if (result && result.status === 'error') {
        throw new Error(`Mathpix PDF处理失败: ${JSON.stringify(result)}`);
      }
        
        console.log(`PDF处理中... 尝试 ${attempts}/${maxAttempts}, 状态: ${result?.status || 'unknown'}`);
        console.log('轮询响应数据:', JSON.stringify(result, null, 2));
      } catch (pollError: any) {
        console.warn(`轮询PDF状态失败 (尝试 ${attempts}):`, pollError.message);
        // 继续尝试，不要因为单次轮询失败而中断
      }
    }
    
    throw new Error('Mathpix PDF处理超时');
  } catch (error: any) {
    console.error('Mathpix PDF API调用失败:');
    console.error('错误详情:', error);
    console.error('错误消息:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    throw error;
  }
}

// 处理Word文档
async function processWordDocument(docBuffer: Buffer): Promise<string> {
  const { apiKey, appId } = getMathpixConfig();
  
  if (!apiKey || !appId) {
    throw new Error('Mathpix API配置缺失');
  }

  try {
    // 上传Word文档
    const formData = new FormData();
    formData.append('file', docBuffer, { filename: 'document.docx' });
    
    const response = await axios.post('https://api.mathpix.com/v3/doc', 
      formData,
      {
        headers: {
          'app_id': appId,
          'app_key': apiKey,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    return response.data.mmd || '';
  } catch (error: any) {
    console.error('Mathpix Word文档处理失败:');
    console.error('错误详情:', error);
    throw error;
  }
}



// 过滤MMD内容中的figure部分
function filterFigureContent(mmdContent: string): string {
  // 删除所有 \begin{figure} ... \end{figure} 部分
  const filteredContent = mmdContent.replace(/\\begin\{figure\}[\s\S]*?\\end\{figure\}/g, '');
  
  // 删除所有 \begin{table} ... \end{table} 部分（通常也包含图片）
  const finalContent = filteredContent.replace(/\\begin\{table\}[\s\S]*?\\end\{table\}/g, '');
  
  console.log('已过滤figure和table内容');
  return finalContent;
}

// 按题目类型分割MMD内容
function splitContentByQuestionType(mmdContent: string): {
  choiceQuestions: string;
  fillQuestions: string;
  solutionQuestions: string;
} {
  const sections = {
    choiceQuestions: '',
    fillQuestions: '',
    solutionQuestions: ''
  };
  
  // 分割内容
  const lines = mmdContent.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    // 检测题目类型
    if (line.includes('选择题') || line.includes('一、选择题')) {
      if (currentSection && currentContent.length > 0) {
        // 保存之前的内容
        if (currentSection === 'choice') {
          sections.choiceQuestions = currentContent.join('\n');
        } else if (currentSection === 'fill') {
          sections.fillQuestions = currentContent.join('\n');
        } else if (currentSection === 'solution') {
          sections.solutionQuestions = currentContent.join('\n');
        }
      }
      currentSection = 'choice';
      currentContent = [line];
    } else if (line.includes('填空题') || line.includes('二、填空题')) {
      if (currentSection && currentContent.length > 0) {
        // 保存之前的内容
        if (currentSection === 'choice') {
          sections.choiceQuestions = currentContent.join('\n');
        } else if (currentSection === 'fill') {
          sections.fillQuestions = currentContent.join('\n');
        } else if (currentSection === 'solution') {
          sections.solutionQuestions = currentContent.join('\n');
        }
      }
      currentSection = 'fill';
      currentContent = [line];
    } else if (line.includes('解答题') || line.includes('三、解答题')) {
      if (currentSection && currentContent.length > 0) {
        // 保存之前的内容
        if (currentSection === 'choice') {
          sections.choiceQuestions = currentContent.join('\n');
        } else if (currentSection === 'fill') {
          sections.fillQuestions = currentContent.join('\n');
        } else if (currentSection === 'solution') {
          sections.solutionQuestions = currentContent.join('\n');
        }
      }
      currentSection = 'solution';
      currentContent = [line];
    } else {
      // 添加到当前内容
      currentContent.push(line);
    }
  }
  
  // 保存最后一个部分
  if (currentSection && currentContent.length > 0) {
    if (currentSection === 'choice') {
      sections.choiceQuestions = currentContent.join('\n');
    } else if (currentSection === 'fill') {
      sections.fillQuestions = currentContent.join('\n');
    } else if (currentSection === 'solution') {
      sections.solutionQuestions = currentContent.join('\n');
    }
  }
  
  console.log('已按题目类型分割内容');
  console.log(`选择题部分: ${sections.choiceQuestions.length} 字符`);
  console.log(`填空题部分: ${sections.fillQuestions.length} 字符`);
  console.log(`解答题部分: ${sections.solutionQuestions.length} 字符`);
  
  return sections;
}

// 处理PDF文档
export async function processPDF(pdfBuffer: Buffer): Promise<{
  choiceQuestions: string;
  fillQuestions: string;
  solutionQuestions: string;
}> {
  try {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF数据为空');
    }
    
    const mmdContent = await callMathpixPDF(pdfBuffer);
    
    // 过滤figure内容
    const filteredContent = filterFigureContent(mmdContent);
    
    // 按题目类型分割内容
    const sections = splitContentByQuestionType(filteredContent);
    
    return sections;
  } catch (error: any) {
    console.error('Mathpix PDF处理失败:', error);
    const enhancedError = new Error(error.message);
    (enhancedError as any).code = 'MATHPIX_PDF_FAILED';
    throw enhancedError;
  }
}

// 处理Word文档
export async function processWord(docBuffer: Buffer): Promise<{
  choiceQuestions: string;
  fillQuestions: string;
  solutionQuestions: string;
}> {
  try {
    if (!docBuffer || docBuffer.length === 0) {
      throw new Error('Word文档数据为空');
    }
    
    const mmdContent = await processWordDocument(docBuffer);
    
    // 过滤figure内容
    const filteredContent = filterFigureContent(mmdContent);
    
    // 按题目类型分割内容
    const sections = splitContentByQuestionType(filteredContent);
    
    return sections;
  } catch (error: any) {
    console.error('Mathpix Word处理失败:', error);
    const enhancedError = new Error(error.message);
    (enhancedError as any).code = 'MATHPIX_WORD_FAILED';
    throw enhancedError;
  }
}