import dotenv from 'dotenv';

dotenv.config();

export const cosConfig = {
  // 腾讯云COS配置
  SecretId: process.env.TENCENT_CLOUD_SECRET_ID || '',
  SecretKey: process.env.TENCENT_CLOUD_SECRET_KEY || '',
  Bucket: process.env.TENCENT_COS_BUCKET || '',
  Region: process.env.TENCENT_COS_REGION || 'ap-beijing', // 默认北京区域
  
  // 存储桶域名
  Domain: process.env.TENCENT_COS_DOMAIN || '',
  
  // 图片存储路径前缀
  ImagePrefix: 'questions/images/',
  
  // 临时图片路径前缀
  TempImagePrefix: 'temp/images/',
  
  // CDN域名（如果有的话）
  CDNDomain: process.env.TENCENT_COS_CDN_DOMAIN || '',
  
  // 图片处理参数
  ImageProcess: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 85,
    format: 'jpeg'
  }
};

// 验证配置
export function validateCosConfig(): boolean {
  const requiredFields = ['SecretId', 'SecretKey', 'Bucket', 'Region'];
  const missingFields = requiredFields.filter(field => !cosConfig[field as keyof typeof cosConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ 腾讯云COS配置缺失:', missingFields);
    return false;
  }
  
  console.log('✅ 腾讯云COS配置验证通过');
  return true;
}
