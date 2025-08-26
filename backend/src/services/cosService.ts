import COS from 'cos-nodejs-sdk-v5';
import { cosConfig } from '../config/cos';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface COSUploadResult {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  format: string;
  size: number;
  width: number;
  height: number;
  cosKey: string; // COS中的文件键
}

export interface COSImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class COSService {
  private cos: COS;
  private bucket: string;
  private region: string;

  constructor() {
    // 验证配置
    if (!cosConfig.SecretId || !cosConfig.SecretKey || !cosConfig.Bucket) {
      throw new Error('腾讯云COS配置不完整，请检查环境变量');
    }

    this.cos = new COS({
      SecretId: cosConfig.SecretId,
      SecretKey: cosConfig.SecretKey,
    });

    this.bucket = cosConfig.Bucket;
    this.region = cosConfig.Region;
  }

  /**
   * 验证配置
   */
  public validateConfig(): boolean {
    return !!(cosConfig.SecretId && cosConfig.SecretKey && cosConfig.Bucket);
  }

  /**
   * 生成唯一的文件名
   */
  private generateFilename(originalName: string, format: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = format.toLowerCase();
    return `${timestamp}_${random}.${ext}`;
  }

  /**
   * 生成带自定义名称的文件名
   */
  private generateFilenameWithCustomName(customName: string, format: string): string {
    // 清理自定义名称，移除特殊字符，只保留字母、数字、中文、下划线、连字符
    const cleanName = customName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    const ext = format.toLowerCase();
    return `${cleanName}_${timestamp}_${random}.${ext}`;
  }

  /**
   * 生成COS文件键
   */
  private generateCosKey(questionId: string, filename: string, isTemp: boolean = false, userId?: string): string {
    const prefix = isTemp ? cosConfig.TempImagePrefix : cosConfig.ImagePrefix;
    
    // 如果提供了用户ID，则按用户ID组织文件结构
    if (userId) {
      return `${prefix}${userId}/${questionId}/${filename}`;
    }
    
    // 否则使用原来的结构
    return `${prefix}${questionId}/${filename}`;
  }

  /**
   * 生成图片访问URL
   */
  private generateImageUrl(cosKey: string): string {
    // 优先使用CDN域名
    if (cosConfig.CDNDomain) {
      return `https://${cosConfig.CDNDomain}/${cosKey}`;
    }
    
    // 使用COS域名
    if (cosConfig.Domain) {
      return `https://${cosConfig.Domain}/${cosKey}`;
    }
    
    // 使用默认COS域名 - 根据腾讯云COS文档格式
    return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${cosKey}`;
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
   * 处理图片（压缩、调整大小等）
   */
  private async processImage(
    buffer: Buffer,
    options: COSImageProcessOptions = {}
  ): Promise<{ buffer: Buffer; format: 'jpeg' | 'png' | 'webp'; width: number; height: number }> {
    const {
      maxWidth = cosConfig.ImageProcess.maxWidth,
      maxHeight = cosConfig.ImageProcess.maxHeight,
      quality = cosConfig.ImageProcess.quality,
      format = cosConfig.ImageProcess.format
    } = options;

    let sharpInstance = sharp(buffer);
    
    // 获取图片信息
    const metadata = await sharpInstance.metadata();
    let { width = 0, height = 0 } = metadata;

    // 调整大小
    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      });
      
      // 重新获取调整后的尺寸
      const resizedMetadata = await sharpInstance.metadata();
      width = resizedMetadata.width || width;
      height = resizedMetadata.height || height;
    }

          // 设置输出格式和质量
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
      }

    // 处理图片
    const processedBuffer = await sharpInstance.toBuffer();

          return {
        buffer: processedBuffer,
        format: format as 'jpeg' | 'png' | 'webp',
        width,
        height
      };
  }

  /**
   * 上传图片到COS
   */
  public async uploadImage(
    questionId: string,
    file: Express.Multer.File,
    options: COSImageProcessOptions = {},
    isTemp: boolean = false,
    userId?: string,
    customName?: string
  ): Promise<COSUploadResult> {
    try {
      console.log('🚀 COS上传图片 - 文件信息:', {
        questionId,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? `Buffer(${file.buffer.length} bytes)` : 'undefined',
        isTemp
      });

      // 验证图片
      const validation = this.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 处理图片
      console.log('🔄 开始处理图片...');
      const processedImage = await this.processImage(file.buffer, options);
      console.log('✅ 图片处理完成:', {
        format: processedImage.format,
        width: processedImage.width,
        height: processedImage.height,
        bufferSize: processedImage.buffer.length
      });
      
      // 生成文件名和COS键
      const filename = customName ? 
        this.generateFilenameWithCustomName(customName, processedImage.format) : 
        this.generateFilename(file.originalname, processedImage.format);
      const cosKey = this.generateCosKey(questionId, filename, isTemp, userId);
      console.log('📝 生成文件信息:', { filename, cosKey, customName });
      
      // 上传到COS
      console.log('📤 开始上传到COS...');
      const uploadResult = await this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: cosKey,
        Body: processedImage.buffer,
        ContentType: `image/${processedImage.format}`,
        CacheControl: 'public, max-age=31536000', // 1年缓存
      });

      console.log('📤 COS上传结果:', {
        statusCode: uploadResult.statusCode,
        ETag: uploadResult.ETag,
        Location: uploadResult.Location
      });

      if (uploadResult.statusCode !== 200) {
        throw new Error('上传到COS失败');
      }

      // 生成访问URL
      const url = this.generateImageUrl(cosKey);
      
      // 生成唯一ID
      const id = isTemp ? `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : uuidv4();

      return {
        id,
        filename,
        originalName: file.originalname,
        url,
        format: processedImage.format as 'jpeg' | 'png' | 'webp',
        size: processedImage.buffer.length,
        width: processedImage.width,
        height: processedImage.height,
        cosKey
      };
    } catch (error) {
      console.error('上传图片到COS失败:', error);
      throw new Error(`上传图片到COS失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 删除COS中的图片
   */
  public async deleteImage(cosKey: string): Promise<void> {
    try {
      await this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: cosKey,
      });
      console.log(`✅ 成功删除COS文件: ${cosKey}`);
    } catch (error) {
      console.error('删除COS文件失败:', error);
      throw new Error(`删除COS文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 批量删除图片
   */
  public async deleteImages(cosKeys: string[]): Promise<void> {
    if (cosKeys.length === 0) return;

    try {
      const deleteObjects = cosKeys.map(key => ({ Key: key }));
      
      await this.cos.deleteMultipleObject({
        Bucket: this.bucket,
        Region: this.region,
        Objects: deleteObjects,
      });
      
      console.log(`✅ 成功批量删除 ${cosKeys.length} 个COS文件`);
    } catch (error) {
      console.error('批量删除COS文件失败:', error);
      throw new Error(`批量删除COS文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 重命名COS中的图片
   */
  public async renameImage(oldCosKey: string, newFilename: string, userId: string): Promise<string> {
    try {
      // 从旧的cosKey中提取路径信息
      const keyParts = oldCosKey.split('/');
      console.log('🔍 COS重命名路径解析:', { keyParts, userId });
      
      // 对于临时图片，路径格式是: temp/images/userId/questionId/filename
      // 对于永久图片，路径格式是: images/userId/questionId/filename
      let prefix, questionId;
      
      if (keyParts[0] === 'temp') {
        // 临时图片
        prefix = 'temp/images';
        questionId = keyParts[3]; // userId在[2]，questionId在[3]
      } else {
        // 永久图片
        prefix = 'images';
        questionId = keyParts[2]; // userId在[1]，questionId在[2]
      }
      
      // 生成新的cosKey
      const newCosKey = `${prefix}/${userId}/${questionId}/${newFilename}`;
      
      console.log('🔍 COS重命名路径生成:', { 
        oldCosKey, 
        newCosKey, 
        prefix, 
        questionId, 
        userId, 
        newFilename 
      });

      // 使用putObject复制文件到新位置（通过下载再上传的方式）
      const response = await fetch(`https://${this.bucket}.cos.${this.region}.myqcloud.com/${oldCosKey}`);
      if (!response.ok) {
        throw new Error('无法下载原文件');
      }

      const buffer = await response.arrayBuffer();
      
      // 根据文件扩展名确定ContentType
      const getContentType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'gif':
            return 'image/gif';
          case 'webp':
            return 'image/webp';
          default:
            return 'image/jpeg';
        }
      };

      // 上传到新位置
      await this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: newCosKey,
        Body: Buffer.from(buffer),
        ContentType: getContentType(newFilename),
      });

      // 删除原文件
      await this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: oldCosKey,
      });

      console.log(`✅ COS图片重命名成功: ${oldCosKey} -> ${newCosKey}`);
      return newCosKey;
    } catch (error) {
      console.error('重命名COS图片失败:', error);
      throw new Error(`重命名COS图片失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 将临时图片转换为永久图片
   */
  public async convertTempToPermanent(
    questionId: string,
    tempImage: any
  ): Promise<COSUploadResult> {
    try {
      // 从临时图片URL下载图片
      const response = await fetch(tempImage.url);
      if (!response.ok) {
        throw new Error('无法下载临时图片');
      }

      const buffer = await response.arrayBuffer();
      
      // 创建文件对象
      const file = {
        buffer: Buffer.from(buffer),
        originalname: tempImage.filename,
        mimetype: `image/${tempImage.format}`,
        size: buffer.byteLength
      } as Express.Multer.File;

      // 从临时图片的cosKey中提取用户ID
      let userId: string | undefined;
      if (tempImage.cosKey) {
        const keyParts = tempImage.cosKey.split('/');
        if (keyParts.length >= 3 && keyParts[0] === 'temp' && keyParts[1] === 'images') {
          userId = keyParts[2]; // 用户ID在第三位
        }
      }

      // 上传为永久图片，保持用户ID路径结构
      const result = await this.uploadImage(questionId, file, {
        maxWidth: cosConfig.ImageProcess.maxWidth,
        maxHeight: cosConfig.ImageProcess.maxHeight,
        quality: cosConfig.ImageProcess.quality,
        format: cosConfig.ImageProcess.format as 'jpeg' | 'png' | 'webp'
      }, false, userId);

      // 删除临时图片
      if (tempImage.cosKey) {
        await this.deleteImage(tempImage.cosKey);
      }

      return result;
    } catch (error) {
      console.error('转换临时图片失败:', error);
      throw new Error(`转换临时图片失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 测试COS连接
   */
  public async testConnection(): Promise<boolean> {
    try {
      // 尝试列出存储桶中的文件（限制为1个）
      const result = await this.cos.getBucket({
        Bucket: this.bucket,
        Region: this.region,
        MaxKeys: 1,
      });

      if (result.statusCode === 200) {
        console.log('✅ 腾讯云COS连接测试成功');
        return true;
      } else {
        console.log('❌ 腾讯云COS连接测试失败');
        return false;
      }
    } catch (error) {
      console.error('❌ 腾讯云COS连接测试失败:', error);
      return false;
    }
  }
}

export default new COSService();
