import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ImageUploadResult {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  format: string;
  size: number;
  width: number;
  height: number;
}

export class ImageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'questions');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001' || 'https://www.mareate.com';
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 获取题目图片目录
   */
  private getQuestionImageDir(questionId: string): string {
    const dir = path.join(this.uploadDir, questionId, 'images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * 生成唯一文件名
   */
  private generateFilename(originalName: string, format: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = format.toLowerCase();
    return `${timestamp}_${random}.${ext}`;
  }

  /**
   * 验证图片文件
   */
  public validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: '不支持的图片格式，仅支持 JPG、PNG、GIF' };
    }

    // 检查文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: '图片文件大小不能超过 5MB' };
    }

    return { valid: true };
  }

  /**
   * 处理图片上传
   */
  public async uploadImage(
    questionId: string,
    file: Express.Multer.File,
    options: ImageProcessOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // 验证图片
      const validation = this.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const imageDir = this.getQuestionImageDir(questionId);
      const imageId = uuidv4();
      
      // 确定输出格式
      const outputFormat = options.format || 'jpeg';
      const filename = this.generateFilename(file.originalname, outputFormat);
      const outputPath = path.join(imageDir, filename);

      // 处理图片
      let sharpInstance = sharp(file.buffer);
      
      // 获取图片信息
      const metadata = await sharpInstance.metadata();
      let { width = 0, height = 0 } = metadata;

      // 调整大小
      if (options.maxWidth || options.maxHeight) {
        sharpInstance = sharpInstance.resize({
          width: options.maxWidth,
          height: options.maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        });
        
        // 重新获取调整后的尺寸
        const resizedMetadata = await sharpInstance.metadata();
        width = resizedMetadata.width || width;
        height = resizedMetadata.height || height;
      }

      // 设置输出格式和质量
      switch (outputFormat) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: options.quality || 85 });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: options.quality || 90 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
          break;
      }

      // 保存处理后的图片
      await sharpInstance.toFile(outputPath);

      // 获取文件大小
      const stats = fs.statSync(outputPath);
      
      // 生成访问URL
      const url = `${this.baseUrl}/uploads/questions/${questionId}/images/${filename}`;

      return {
        id: imageId,
        filename,
        originalName: file.originalname,
        url,
        format: outputFormat,
        size: stats.size,
        width,
        height
      };
    } catch (error) {
      console.error('图片上传失败:', error);
      throw new Error(`图片上传失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 删除图片文件
   */
  public async deleteImage(questionId: string, filename: string): Promise<void> {
    try {
      const imageDir = this.getQuestionImageDir(questionId);
      const filePath = path.join(imageDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('删除图片失败:', error);
      throw new Error(`删除图片失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 批量删除题目的所有图片
   */
  public async deleteQuestionImages(questionId: string): Promise<void> {
    try {
      const imageDir = this.getQuestionImageDir(questionId);
      
      if (fs.existsSync(imageDir)) {
        const files = fs.readdirSync(imageDir);
        for (const file of files) {
          fs.unlinkSync(path.join(imageDir, file));
        }
        fs.rmdirSync(imageDir);
      }
    } catch (error) {
      console.error('批量删除图片失败:', error);
      throw new Error(`批量删除图片失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取图片信息
   */
  public async getImageInfo(questionId: string, filename: string): Promise<any> {
    try {
      const imageDir = this.getQuestionImageDir(questionId);
      const filePath = path.join(imageDir, filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('图片文件不存在');
      }

      const stats = fs.statSync(filePath);
      const metadata = await sharp(filePath).metadata();
      
      return {
        filename,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.error('获取图片信息失败:', error);
      throw new Error(`获取图片信息失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new ImageService();
