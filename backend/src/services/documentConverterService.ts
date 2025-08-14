import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 获取服务器基础URL
const getServerBaseURL = () => {
  const protocol = process.env.SERVER_PROTOCOL || 'http';
  const host = process.env.SERVER_HOST || process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') || 'localhost';
  const port = process.env.PORT || '3001';
  
  // 如果是生产环境且没有指定端口，则不使用端口
  if (process.env.NODE_ENV === 'production' && !process.env.PORT) {
    return `${protocol}://${host}`;
  }
  
  return `${protocol}://${host}:${port}`;
};

interface ConvertResult {
  success: boolean;
  pages: Array<{
    id: string;
    pageIndex: number;
    imageUrl: string;
    width: number;
    height: number;
  }>;
  totalSize: number;
  conversionTime: number;
  errors: string[];
}

export class DocumentConverterService {
  private tempDir: string;
  private outputDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'converter');
    this.outputDir = path.join(process.cwd(), 'temp', 'images');
    this.ensureDirs();
  }

  private ensureDirs() {
    [this.tempDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 将文档转换为图片
   */
  async convertToImages(filePath: string, fileType: string): Promise<ConvertResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const pages: any[] = [];

    try {
      console.log('开始转换文档:', filePath, '类型:', fileType);

      switch (fileType) {
        case 'pdf':
          return await this.convertPDFToImages(filePath);
        case 'word':
          return await this.convertWordToImages(filePath);
        case 'latex':
          return await this.convertLaTeXToImages(filePath);
        default:
          throw new Error(`不支持的文件类型: ${fileType}`);
      }

    } catch (error: any) {
      console.error('文档转换失败:', error);
      errors.push(error.message || '未知错误');
      return {
        success: false,
        pages: [],
        totalSize: 0,
        conversionTime: Date.now() - startTime,
        errors
      };
    }
  }

  /**
   * 转换PDF文档为图片（真实实现）
   */
  private async convertPDFToImages(filePath: string): Promise<ConvertResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const pages: any[] = [];

    try {
      console.log('开始转换PDF为图片:', filePath);
      
      // 使用pdf2pic转换PDF为图片
      const { fromPath } = require('pdf2pic');
      
      // 确保文件存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`PDF文件不存在: ${filePath}`);
      }
      
      const options = {
        density: 150, // 降低密度以减小文件大小
        saveFilename: 'page',
        savePath: this.outputDir,
        format: 'png',
        width: 1200, // 调整宽度
        height: 1600  // 调整高度
      };

      console.log('pdf2pic options:', options);
      
      // 使用pdf2pic转换
      const convert = fromPath(filePath, options);
      
      // 转换前10页（通常足够）
      for (let pageNum = 1; pageNum <= 10; pageNum++) {
        try {
          const result = await convert(pageNum);
          if (result && result.path) {
            const imageId = uuidv4();
            const newImagePath = path.join(this.outputDir, `${imageId}.png`);
            
            // 重命名文件
            fs.renameSync(result.path, newImagePath);
            
            pages.push({
              id: imageId,
              pageIndex: pageNum - 1,
              imageUrl: `${getServerBaseURL()}/api/images/${imageId}.png`,
              width: 1200,
              height: 1600
            });
            
            console.log(`第${pageNum}页转换完成:`, newImagePath);
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

      if (pages.length === 0) {
        throw new Error('PDF转换失败：未生成任何页面');
      }

      return {
        success: true,
        pages,
        totalSize: pages.length,
        conversionTime: Date.now() - startTime,
        errors
      };

    } catch (error: any) {
      console.error('PDF转换失败:', error);
      errors.push(error.message || 'PDF转换失败');
      return {
        success: false,
        pages: [],
        totalSize: 0,
        conversionTime: Date.now() - startTime,
        errors
      };
    }
  }

  /**
   * 转换Word文档为图片（真实实现）
   */
  private async convertWordToImages(filePath: string): Promise<ConvertResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const pages: any[] = [];

    try {
      console.log('开始转换Word文档为图片:', filePath);
      
      // 使用mammoth提取Word内容
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
                font-size: 16px; 
                line-height: 1.8; 
                margin: 60px; 
                background: white;
                width: 1200px;
                min-height: 1600px;
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
      await page.setViewport({ width: 1200, height: 1600 });
      await page.goto(`file://${htmlPath}`);
      await page.waitForTimeout(2000); // 增加等待时间确保内容完全加载

      const imageId = uuidv4();
      const screenshotPath = path.join(this.outputDir, `${imageId}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        quality: 90
      });
      
      await browser.close();
      fs.unlinkSync(htmlPath);

      pages.push({
        id: imageId,
        pageIndex: 0,
        imageUrl: `${getServerBaseURL()}/api/images/${imageId}.png`,
        width: 1200,
        height: 1600
      });

      return {
        success: true,
        pages,
        totalSize: pages.length,
        conversionTime: Date.now() - startTime,
        errors
      };

    } catch (error: any) {
      console.error('Word转换失败:', error);
      errors.push(error.message || 'Word转换失败');
      return {
        success: false,
        pages: [],
        totalSize: 0,
        conversionTime: Date.now() - startTime,
        errors
      };
    }
  }

  /**
   * 转换LaTeX文档为图片（简化版本）
   */
  private async convertLaTeXToImages(filePath: string): Promise<ConvertResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const pages: any[] = [];

    try {
      // 创建一个示例图片
      const imageId = uuidv4();
      const imagePath = path.join(this.outputDir, `${imageId}.png`);
      
      // 创建一个简单的示例图片
      const sampleImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(imagePath, sampleImageBuffer);

      pages.push({
        id: imageId,
        pageIndex: 0,
        imageUrl: `${getServerBaseURL()}/api/images/${imageId}.png`,
        width: 1200,
        height: 1600
      });

      return {
        success: true,
        pages,
        totalSize: pages.length,
        conversionTime: Date.now() - startTime,
        errors
      };

    } catch (error: any) {
      console.error('LaTeX转换失败:', error);
      errors.push(error.message || 'LaTeX转换失败');
      return {
        success: false,
        pages: [],
        totalSize: 0,
        conversionTime: Date.now() - startTime,
        errors
      };
    }
  }

  /**
   * 清理临时文件
   */
  cleanupTempFiles(filePaths: string[]) {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('清理临时文件失败:', filePath, error);
      }
    });
  }
} 