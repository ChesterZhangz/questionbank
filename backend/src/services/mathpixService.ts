import axios from 'axios';
import FormData from 'form-data';

// Mathpix配置
function getMathpixConfig() {
  const apiKey = process.env.MATHPIX_API_KEY;
  const appId = process.env.MATHPIX_APP_ID || 'mareate_internal';
  
  if (!apiKey) {
    throw new Error('Mathpix API密钥未配置');
  }
  
  return { apiKey, appId };
}

// 按题目类型分割MMD内容
function splitContentByQuestionType(mmdContent: string): {
  choiceQuestions: string;
  fillQuestions: string;
  solutionQuestions: string;
  isFreeFormat: boolean;
  freeFormatContent?: string;
} {
  const sections = {
    choiceQuestions: '',
    fillQuestions: '',
    solutionQuestions: '',
    isFreeFormat: false,
    freeFormatContent: ''
  };
  
  // 检测是否有明确的题型标记
  const hasExplicitTypeMarkers = mmdContent.includes('选择题') || 
                                 mmdContent.includes('填空题') || 
                                 mmdContent.includes('解答题') ||
                                 mmdContent.includes('一、') ||
                                 mmdContent.includes('二、') ||
                                 mmdContent.includes('三、');
  
  // 如果没有明确的题型标记，标记为自由格式
  if (!hasExplicitTypeMarkers) {
    console.log('未检测到明确的题型标记，采用自由格式处理');
    sections.isFreeFormat = true;
    sections.freeFormatContent = mmdContent;
    return sections;
  }
  
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
export async function processPDF(
  pdfBuffer: Buffer,
  onProgress?: (progress: number) => void
): Promise<{
  choiceQuestions: string;
  fillQuestions: string;
  solutionQuestions: string;
  isFreeFormat: boolean;
  freeFormatContent?: string;
}> {
  try {
    console.log('📄 开始处理PDF文档...');
    
    const { apiKey, appId } = getMathpixConfig();
    
    console.log('🌐 调用Mathpix PDF处理API...');
    
    // 创建FormData
    const formData = new FormData();
    formData.append('file', pdfBuffer, { 
      filename: 'document.pdf',
      contentType: 'application/pdf'
    });
    
    // 设置转换选项 - 根据Mathpix API文档
    const options = {
      formats: ['mmd', 'text'],
      data_options: {
        include_asciimath: true,
        include_latex: true,
        include_mathml: true
      },
      conversion_timeout: 120
    };
    
    formData.append('options_json', JSON.stringify(options));
    
    // 添加调试信息
    console.log('🔧 转换选项:', JSON.stringify(options, null, 2));
    
    console.log('📤 发送PDF文档到Mathpix...');
    
    const response = await axios.post('https://api.mathpix.com/v3/pdf', 
      formData,
      {
        headers: {
          'app_id': appId,
          'app_key': apiKey,
          ...formData.getHeaders()
        },
        timeout: 120000
      }
    );
    
    console.log('✅ Mathpix PDF处理成功');
    
    if (response.data && response.data.pdf_id) {
      console.log('📋 PDF ID:', response.data.pdf_id);
      
      // 等待处理完成并获取结果
      const result = await waitForPDFProcessing(response.data.pdf_id, apiKey, appId, 60, (progress, status) => {
        // 调用外部传入的进度回调
        if (onProgress) {
          onProgress(progress);
        }
        console.log(`Mathpix处理进度: ${progress}%, 状态: ${status}`);
      });
      
      if (result && result.status === 'completed') {
        console.log('✅ PDF处理完成，状态:', result.status);
        console.log('📊 完整结果:', JSON.stringify(result, null, 2));
        
        // 尝试获取MMD内容
        const mmdContent = await getPDFMMDContent(response.data.pdf_id, apiKey, appId);
        
        if (mmdContent) {
          console.log('✅ 成功获取MMD内容，长度:', mmdContent.length);
          console.log('📄 MMD内容预览:', mmdContent.substring(0, 200) + '...');
          

          
          // 使用MMD内容进行题目分割
          const sections = splitContentByQuestionType(mmdContent);
          return sections;
        } else {
          console.log('⚠️ 无法获取MMD内容，使用PDF内容作为自由格式文本');
          
          // 创建一个自由格式的结果
          const sections = {
            choiceQuestions: '',
            fillQuestions: '',
            solutionQuestions: '',
            isFreeFormat: true,
            freeFormatContent: `# PDF处理结果\n\n此PDF已成功处理，但由于API限制无法获取详细内容。\n\n文件信息:\n- 文件名: ${result.input_file}\n- 页数: ${result.num_pages}\n- 处理状态: ${result.status}\n\n请使用其他方法查看PDF内容。`
          };
          
          return sections;
        }
      } else if (result) {
        console.error('❌ Mathpix返回结果格式异常:');
        console.error('📊 完整结果:', JSON.stringify(result, null, 2));
        console.error('🔍 结果类型:', typeof result);
        
        throw new Error(`Mathpix处理失败: ${result.status || '未知状态'}`);
      } else {
        throw new Error('Mathpix未返回有效结果');
      }
    } else {
      throw new Error('Mathpix未返回PDF ID');
    }
  } catch (error: any) {
    console.error('❌ PDF处理失败:', error);
    
    if (error.response) {
      console.error('🌐 HTTP状态码:', error.response.status);
      console.error('🌐 响应数据:', error.response.data);
      
      if (error.response.status === 401) {
        throw new Error('Mathpix API认证失败，请检查API密钥配置');
      } else if (error.response.status === 413) {
        throw new Error('PDF文件过大，请压缩后重试');
      } else if (error.response.status === 429) {
        throw new Error('Mathpix API请求过于频繁，请稍后重试');
      } else if (error.response.status >= 500) {
        throw new Error('Mathpix服务器错误，请稍后重试');
      }
    }
    
    throw new Error(`PDF处理失败: ${error.message}`);
  }
}

// 等待PDF处理完成 - 支持SSE进度更新
async function waitForPDFProcessing(
  pdfId: string, 
  apiKey: string, 
  appId: string, 
  maxAttempts: number = 60,
  onProgress?: (progress: number, status: string) => void
): Promise<any> {
  console.log('⏳ 等待PDF处理完成...');
  
  let attempts = 0;
  const pollInterval = 2000; // 2秒间隔，更频繁的更新
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // 计算当前进度（基于尝试次数）
    const progress = Math.min(90, Math.round((attempts / maxAttempts) * 90)); // 最多到90%，留10%给完成
    
    try {
      console.log(`🔄 轮询状态 - 尝试 ${attempts}/${maxAttempts}...`);
      
      const response = await axios.get(`https://api.mathpix.com/v3/pdf/${pdfId}`, {
        headers: {
          'app_id': appId,
          'app_key': apiKey
        },
        timeout: 10000 // 10秒超时
      });
      
      const result = response.data;
      console.log(`📊 当前状态: ${result?.status || 'unknown'}`);
      
      // 发送进度更新
      if (onProgress) {
        onProgress(progress, result?.status || 'processing');
      }
      
      if (result && result.status === 'completed') {
        console.log(`✅ PDF处理完成！尝试次数: ${attempts}`);
        
        // 发送100%进度
        if (onProgress) {
          onProgress(100, 'completed');
        }
        
        // 等待一段时间让结果准备好
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📊 返回数据结构:', Object.keys(result));
        console.log('📊 状态:', result.status);
        return result;
      } else if (result && result.status === 'error') {
        console.error('❌ PDF处理失败:', result);
        throw new Error(`Mathpix PDF处理失败: ${JSON.stringify(result)}`);
      }
      
      console.log(`⏳ PDF处理中... 状态: ${result?.status || 'unknown'}`);
      
    } catch (error: any) {
      console.warn(`⚠️ 轮询PDF状态失败 (尝试 ${attempts}):`, error.message);
      
      if (attempts === maxAttempts) {
        console.error('❌ 达到最大重试次数，PDF处理超时');
        throw new Error(`PDF处理超时: ${error.message}`);
      }
      
      // 继续尝试，不要因为单次轮询失败而中断
    }
    
    // 等待下一次轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error('Mathpix PDF处理超时');
}

// 获取PDF的MMD内容 - 使用旧版本有效的方法
async function getPDFMMDContent(pdfId: string, apiKey: string, appId: string): Promise<string | null> {
  try {
    console.log('🔍 使用旧版本有效方法获取PDF的MMD内容...');
    
    // 方法1: 尝试获取.mmd格式的结果 (旧版本API - 最有效)
    try {
      console.log('📄 方法1: 尝试获取.mmd格式结果...');
      const mmdResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${pdfId}.mmd`, {
        headers: {
          'app_id': appId,
          'app_key': apiKey
        },
        timeout: 10000
      });
      
      console.log('✅ MMD结果获取成功');
      console.log('📊 响应类型:', typeof mmdResponse.data);
      console.log('📊 响应长度:', mmdResponse.data?.length || 0);
      
      if (typeof mmdResponse.data === 'string' && mmdResponse.data.length > 0) {
        console.log('📄 MMD内容预览:', mmdResponse.data.substring(0, 500) + '...');
        return mmdResponse.data;
      } else if (mmdResponse.data && mmdResponse.data.mmd) {
        console.log('📄 从响应对象中提取MMD内容...');
        return mmdResponse.data.mmd;
      }
    } catch (mmdError: any) {
      console.warn('⚠️ 获取MMD结果失败:', mmdError.message);
    }
    
    // 方法2: 尝试获取.txt格式的结果 (旧版本API)
    try {
      console.log('📄 方法2: 尝试获取.txt格式结果...');
      const txtResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${pdfId}.txt`, {
        headers: {
          'app_id': appId,
          'app_key': apiKey
        },
        timeout: 10000
      });
      
      console.log('✅ 文本结果获取成功');
      console.log('📊 响应类型:', typeof txtResponse.data);
      console.log('📊 响应长度:', txtResponse.data?.length || 0);
      
      if (typeof txtResponse.data === 'string' && txtResponse.data.length > 0) {
        console.log('📄 文本内容预览:', txtResponse.data.substring(0, 500) + '...');
        return txtResponse.data;
      } else if (txtResponse.data && txtResponse.data.text) {
        console.log('📄 从响应对象中提取文本内容...');
        return txtResponse.data.text;
      }
    } catch (txtError: any) {
      console.warn('⚠️ 获取文本结果失败:', txtError.message);
    }
    
    // 方法3: 尝试获取.html格式的结果 (旧版本API)
    try {
      console.log('📄 方法3: 尝试获取.html格式结果...');
      const htmlResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${pdfId}.html`, {
        headers: {
          'app_id': appId,
          'app_key': apiKey
        },
        timeout: 10000
      });
      
      console.log('✅ HTML结果获取成功');
      console.log('📊 响应类型:', typeof htmlResponse.data);
      console.log('📊 响应长度:', htmlResponse.data?.length || 0);
      
      if (typeof htmlResponse.data === 'string' && htmlResponse.data.length > 0) {
        console.log('📄 HTML内容预览:', htmlResponse.data.substring(0, 500) + '...');
        return htmlResponse.data;
      } else if (htmlResponse.data && htmlResponse.data.html) {
        console.log('📄 从响应对象中提取HTML内容...');
        return htmlResponse.data.html;
      }
    } catch (htmlError: any) {
      console.warn('⚠️ 获取HTML结果失败:', htmlError.message);
    }
    
    // 方法4: 尝试使用查询参数获取结果 (旧版本API)
    try {
      console.log('📄 方法4: 尝试使用查询参数获取结果...');
      const queryResponse = await axios.get(`https://api.mathpix.com/v3/pdf/${pdfId}`, {
        headers: {
          'app_id': appId,
          'app_key': apiKey
        },
        params: {
          format: 'mmd'
        },
        timeout: 10000
      });
      
      console.log('✅ 查询结果响应成功');
      console.log('📊 查询结果响应:', JSON.stringify(queryResponse.data, null, 2));
      
      if (queryResponse.data.mmd) {
        console.log('📄 从查询响应中提取MMD内容...');
        return queryResponse.data.mmd;
      }
      
      if (queryResponse.data.text) {
        console.log('📄 从查询响应中提取文本内容...');
        return queryResponse.data.text;
      }
      
      if (queryResponse.data.html) {
        console.log('📄 从查询响应中提取HTML内容...');
        return queryResponse.data.html;
      }
    } catch (queryError: any) {
      console.warn('⚠️ 查询结果失败:', queryError.message);
    }
    
    console.log('❌ 无法获取任何格式的MMD内容');
    return null;
    
  } catch (error: any) {
    console.error('❌ 获取PDF MMD内容失败:', error);
    return null;
  }
}

