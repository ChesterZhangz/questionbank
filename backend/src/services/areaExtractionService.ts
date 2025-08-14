import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { splitPDFIntoPages, extractContentFromArea } from '../utils/pdfUtils';

export interface AreaExtractionResult {
  imagePath: string;
  areaInfo: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
  };
  success: boolean;
  error?: string;
}

export class AreaExtractionService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'area-extractions');
    this.ensureTempDir();
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 从PDF中精确截取指定区域并保存为图片
   */
  async extractPDFArea(filePath: string, area: any): Promise<AreaExtractionResult> {
    try {
      
      // 使用pdf-parse提取文本内容，然后模拟区域截取
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      
      const data = await pdfParse(dataBuffer);
      const fullText = data.text;
      
      // 分析PDF页面结构
      const pages = splitPDFIntoPages(fullText);
      
      // 获取指定页面的内容
      const targetPageIndex = area.pageNumber - 1;
      if (targetPageIndex < 0 || targetPageIndex >= pages.length) {
        console.warn(`页面索引超出范围: ${targetPageIndex}, 总页数: ${pages.length}`);
        return {
          imagePath: '',
          areaInfo: area,
          success: false,
          error: `页面索引超出范围: ${targetPageIndex}, 总页数: ${pages.length}`
        };
      }
      
      const pageContent = pages[targetPageIndex];
      console.log(`处理第${area.pageNumber}页，内容长度: ${pageContent.length}`);
      
      // 智能区域提取：基于页面内容的相对位置
      const extractedText = extractContentFromArea(pageContent, area);
      
      if (!extractedText.trim()) {
        return {
          imagePath: '',
          areaInfo: area,
          success: false,
          error: '区域内容为空，请重新选择区域'
        };
      }
      
      // 创建临时文本文件作为"图片"（用于OCR处理）
      const outputPath = path.join(this.tempDir, `area_${area.id}_${Date.now()}.txt`);
      fs.writeFileSync(outputPath, extractedText);
      
      console.log('PDF区域提取成功:', outputPath);
      console.log('提取内容:', extractedText.substring(0, 200) + '...');
      
      return {
        imagePath: outputPath,
        areaInfo: area,
        success: true
      };

    } catch (error: any) {
      console.error('PDF区域截取失败:', error);
      
      return {
        imagePath: '',
        areaInfo: area,
        success: false,
        error: `PDF区域截取失败: ${error.message}。请尝试手动选择区域。`
      };
    }
  }

  /**
   * 从Word文档中截取区域
   */
  async extractWordArea(filePath: string, area: any): Promise<AreaExtractionResult> {
    try {
      console.log('开始截取Word区域:', area);
      
      // 使用mammoth提取文本内容
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      
      // 创建临时HTML文件
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
                min-height: 1000px;
              }
            </style>
          </head>
          <body>${result.value.replace(/\n/g, '<br>')}</body>
        </html>
      `;
      
      const htmlPath = path.join(this.tempDir, `word_${Date.now()}.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      // 使用puppeteer截图
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 800, height: 1000 });
      await page.goto(`file://${htmlPath}`);
      
      // 等待内容加载
      await page.waitForTimeout(1000);
      
      // 截取整个页面
      const screenshotPath = path.join(this.tempDir, `word_full_${Date.now()}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      await browser.close();

      // 使用sharp进行区域裁剪
      const sharp = require('sharp');
      const outputPath = path.join(this.tempDir, `area_${area.id}_${Date.now()}.png`);
      
      // 获取图片信息
      const imageInfo = await sharp(screenshotPath).metadata();
      
      // 计算实际裁剪区域
      const cropX = Math.floor(area.x);
      const cropY = Math.floor(area.y);
      const cropWidth = Math.floor(area.width);
      const cropHeight = Math.floor(area.height);
      
      await sharp(screenshotPath)
        .extract({
          left: cropX,
          top: cropY,
          width: cropWidth,
          height: cropHeight
        })
        .png()
        .toFile(outputPath);

      // 清理临时文件
      fs.unlinkSync(htmlPath);
      fs.unlinkSync(screenshotPath);

      console.log('Word区域截取成功:', outputPath);
      
      return {
        imagePath: outputPath,
        areaInfo: area,
        success: true
      };

    } catch (error: any) {
      console.error('Word区域截取失败:', error);
      return {
        imagePath: '',
        areaInfo: area,
        success: false,
        error: `Word区域截取失败: ${error.message}。请尝试手动选择区域。`
      };
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles() {
    try {
      const files = fs.readdirSync(this.tempDir);
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        fs.unlinkSync(filePath);
      }
      console.log('临时文件清理完成');
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}

export default AreaExtractionService; 