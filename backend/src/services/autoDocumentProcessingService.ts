import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ParsedQuestion, AutoProcessResult } from '../types/document';

export class AutoDocumentProcessingService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'auto-processing');
    this.ensureTempDir();
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 自动处理文档：截图每一页 → OCR识别 → DeepSeek优化
   */
  async processDocument(filePath: string, fileType: string): Promise<AutoProcessResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const allQuestions: any[] = [];

    try {
      console.log('开始自动处理文档:', filePath, '类型:', fileType);

      // 特殊处理：TeX文件不需要OCR，直接使用文本处理
      if (fileType === 'latex') {
        return await this.processLaTeXDocument(filePath);
      }

      // 1. 根据文件类型生成页面截图
      const pageImages = await this.generatePageImages(filePath, fileType);
      
      if (pageImages.length === 0) {
        throw new Error('无法生成页面截图');
      }


      // 2. 对每一页进行OCR识别
      const questionSplitOCRService = require('./questionSplitOCRService').default;
      const ocrService = new questionSplitOCRService();

      for (let pageIndex = 0; pageIndex < pageImages.length; pageIndex++) {
        try {
          const pageImage = pageImages[pageIndex];
          console.log(`处理第 ${pageIndex + 1} 页截图:`, pageImage);

          // 读取图片并转换为Base64
          const imageBuffer = fs.readFileSync(pageImage);
          const imageBase64 = imageBuffer.toString('base64');

          // 使用腾讯云OCR识别
          const ocrResult = await ocrService.parseQuestions({
            imageBase64: imageBase64,
            returnText: true,
            returnCoord: true,
            returnType: 'auto'
          });

          if (ocrResult && ocrResult.length > 0) {

            // 3. 对每道题进行DeepSeek优化
            for (const question of ocrResult) {
              try {
                const optimizedQuestion = await this.optimizeWithDeepSeek(question);
                allQuestions.push({
                  ...optimizedQuestion,
                  source: `第${pageIndex + 1}页`,
                  pageNumber: pageIndex + 1
                });
              } catch (deepSeekError: any) {
                console.error('DeepSeek优化失败:', deepSeekError);
                // 如果DeepSeek失败，使用原始题目
                allQuestions.push({
                  ...question,
                  source: `第${pageIndex + 1}页`,
                  pageNumber: pageIndex + 1
                });
                errors.push(`DeepSeek优化失败: ${deepSeekError?.message || '未知错误'}`);
              }
            }
          } else {
            console.warn(`第 ${pageIndex + 1} 页未识别到题目`);
          }

        } catch (pageError: any) {
          console.error(`处理第 ${pageIndex + 1} 页失败:`, pageError);
          errors.push(`第 ${pageIndex + 1} 页处理失败: ${pageError?.message || '未知错误'}`);
        }
      }

      // 4. 清理临时文件
      this.cleanupTempFiles(pageImages);

      const processingTime = Date.now() - startTime;
      const averageConfidence = allQuestions.length > 0 
        ? allQuestions.reduce((sum, q) => sum + (q.confidence || 0), 0) / allQuestions.length 
        : 0;

      return {
        success: allQuestions.length > 0,
        questions: allQuestions,
        statistics: {
          totalPages: pageImages.length,
          totalQuestions: allQuestions.length,
          processingTime,
          confidence: averageConfidence
        },
        errors
      };

    } catch (error: any) {
      console.error('自动文档处理失败:', error);
      return {
        success: false,
        questions: [],
        statistics: {
          totalPages: 0,
          totalQuestions: 0,
          processingTime: Date.now() - startTime,
          confidence: 0
        },
        errors: [error.message]
      };
    }
  }

  /**
   * 处理LaTeX文档（不需要OCR）
   */
  private async processLaTeXDocument(filePath: string): Promise<AutoProcessResult> {
    try {
      console.log('处理LaTeX文档:', filePath);
      
      // 读取LaTeX文件内容
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 使用DeepSeek直接处理LaTeX内容
      const { correctLatexWithDeepSeek } = require('./deepseekAI');
      const optimizedContent = await correctLatexWithDeepSeek(content);
      
      // 创建题目对象
      const question: ParsedQuestion = {
        _id: uuidv4(),
        content: {
          stem: content,
          answer: ''
        },
        type: 'solution',
        difficulty: 3,
        category: '数学',
        tags: ['LaTeX', '自动处理'],
        source: 'LaTeX文档',
        confidence: 0.9,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return {
        success: true,
        questions: [question],
        statistics: {
          totalPages: 1,
          totalQuestions: 1,
          processingTime: 0,
          confidence: 0.9
        },
        errors: []
      };
      
    } catch (error: any) {
      console.error('LaTeX文档处理失败:', error);
      return {
        success: false,
        questions: [],
        statistics: {
          totalPages: 0,
          totalQuestions: 0,
          processingTime: 0,
          confidence: 0
        },
        errors: [error.message]
      };
    }
  }

  /**
   * 生成页面截图
   */
  private async generatePageImages(filePath: string, fileType: string): Promise<string[]> {
    const pageImages: string[] = [];

    try {
      console.log('generatePageImages - filePath:', filePath, 'fileType:', fileType);
      console.log('generatePageImages - tempDir:', this.tempDir);
      
      if (fileType === 'pdf') {
        const { fromPath } = require('pdf2pic');
        
        // 确保文件存在
        if (!fs.existsSync(filePath)) {
          throw new Error(`PDF文件不存在: ${filePath}`);
        }
        
        // 使用绝对路径
        const absoluteFilePath = path.resolve(filePath);
        console.log('PDF绝对路径:', absoluteFilePath);
        
        const options = {
          density: 300,
          saveFilename: 'page',
          savePath: this.tempDir,
          format: 'png',
          width: 2000,
          height: 2800
        };

        console.log('pdf2pic options:', options);
        console.log('开始转换PDF:', absoluteFilePath);
        
        // 使用pdf2pic转换
        const convert = fromPath(absoluteFilePath, options);
        
        // 转换前10页（通常足够）
        for (let pageNum = 1; pageNum <= 10; pageNum++) {
          try {
            const result = await convert(pageNum);
            if (result && result.path) {
              pageImages.push(result.path);
              console.log(`第${pageNum}页转换完成:`, result.path);
            } else {
              // 如果没有结果，说明已经到最后一页
              break;
            }
          } catch (error: any) {
            // 如果转换失败，说明已经到最后一页
            console.log(`第${pageNum}页转换失败，可能是最后一页:`, error?.message || '未知错误');
            break;
          }
        }

        // 查找生成的文件
        const files = fs.readdirSync(this.tempDir);
        const pngFiles = files.filter(file => file.endsWith('.png')).sort();
        
        for (const file of pngFiles) {
          pageImages.push(path.join(this.tempDir, file));
        }

      } else if (fileType === 'word') {
        // Word文件：使用puppeteer生成截图
        const mammoth = require('mammoth');
        const puppeteer = require('puppeteer');

        // 提取Word内容
        const result = await mammoth.extractRawText({ path: filePath });
        
        // 创建HTML文件
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  font-size: 14px; 
                  line-height: 1.6; 
                  margin: 40px; 
                  background: white;
                  width: 800px;
                }
              </style>
            </head>
            <body>${result.value.replace(/\n/g, '<br>')}</body>
          </html>
        `;
        
        const htmlPath = path.join(this.tempDir, 'word_content.html');
        fs.writeFileSync(htmlPath, htmlContent);

        // 使用puppeteer截图
        const browser = await puppeteer.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1000 });
        await page.goto(`file://${htmlPath}`);
        await page.waitForTimeout(1000);

        const screenshotPath = path.join(this.tempDir, 'page_1.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        await browser.close();
        fs.unlinkSync(htmlPath);

        pageImages.push(screenshotPath);

      } else {
        // 其他文件类型：直接使用原文件
        const imagePath = path.join(this.tempDir, `original_${Date.now()}.${fileType}`);
        fs.copyFileSync(filePath, imagePath);
        pageImages.push(imagePath);
      }

    } catch (error) {
      console.error('生成页面截图失败:', error);
      throw error;
    }

    return pageImages;
  }

  /**
   * 使用DeepSeek优化题目
   */
  private async optimizeWithDeepSeek(question: any): Promise<ParsedQuestion> {
    try {
      // 直接使用DeepSeek的correctLatex方法处理题目内容
      const { correctLatexWithDeepSeek } = require('./deepseekAI');
      
      // 处理题目内容
      const optimizedStem = await correctLatexWithDeepSeek(question.content || '');
      
      // 处理答案（如果有的话）
      let optimizedAnswer = '';
      if (question.answer) {
        optimizedAnswer = await correctLatexWithDeepSeek(question.answer);
      }

      return {
        _id: question._id || uuidv4(),
        content: {
          stem: optimizedStem,
          options: question.options || [],
          answer: optimizedAnswer
        },
        type: question.type || 'solution',
        difficulty: question.difficulty || 3,
        category: question.category || '数学',
        tags: question.tags || ['自动处理'],
        source: question.source || '自动处理',
        confidence: Math.max(question.confidence || 0, 0.8), // 优化后提高置信度
        createdAt: new Date(),
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('DeepSeek优化失败:', error);
      // 返回原始题目，但确保符合接口
      return {
        _id: question._id || uuidv4(),
        content: {
          stem: question.content || '',
          options: question.options || [],
          answer: question.answer || ''
        },
        type: question.type || 'solution',
        difficulty: question.difficulty || 3,
        category: question.category || '数学',
        tags: question.tags || ['自动处理'],
        source: question.source || '自动处理',
        confidence: question.confidence || 0.5,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  /**
   * 清理临时文件
   */
  private cleanupTempFiles(files: string[]) {
    try {
      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }
      console.log('临时文件清理完成');
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}

export default AutoDocumentProcessingService; 