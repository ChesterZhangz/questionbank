const COS = require('cos-nodejs-sdk-v5');
require('dotenv').config();

// 配置COS
const cos = new COS({
  SecretId: process.env.TENCENT_CLOUD_SECRET_ID,
  SecretKey: process.env.TENCENT_CLOUD_SECRET_KEY,
});

const bucket = process.env.TENCENT_COS_BUCKET;
const region = process.env.TENCENT_COS_REGION || 'ap-singapore';

async function checkAndFixCosPermissions() {
  try {
    console.log('🔍 检查腾讯云COS存储桶权限...');
    console.log(`存储桶: ${bucket}`);
    console.log(`区域: ${region}`);
    
    // 1. 检查存储桶ACL
    console.log('\n📋 检查存储桶ACL...');
    try {
      const aclResult = await cos.getBucketAcl({
        Bucket: bucket,
        Region: region,
      });
      
      console.log('✅ 存储桶ACL获取成功:', {
        Owner: aclResult.Acl.Owner,
        Grants: aclResult.Acl.Grants
      });
      
      // 检查是否有公开读取权限
      const hasPublicRead = aclResult.Acl.Grants.some(grant => 
        grant.Grantee.URI === 'http://cam.qcloud.com/groups/global/AllUsers' &&
        grant.Permission === 'READ'
      );
      
      if (hasPublicRead) {
        console.log('✅ 存储桶已有公开读取权限');
      } else {
        console.log('❌ 存储桶缺少公开读取权限，正在修复...');
        
        // 设置公开读取权限
        await cos.putBucketAcl({
          Bucket: bucket,
          Region: region,
          ACL: 'public-read',
        });
        
        console.log('✅ 已设置存储桶为公开读取权限');
      }
      
    } catch (error) {
      console.error('❌ 获取存储桶ACL失败:', error.message);
      
      // 尝试直接设置公开读取权限
      console.log('🔄 尝试直接设置公开读取权限...');
      try {
        await cos.putBucketAcl({
          Bucket: bucket,
          Region: region,
          ACL: 'public-read',
        });
        console.log('✅ 已设置存储桶为公开读取权限');
      } catch (setError) {
        console.error('❌ 设置公开读取权限失败:', setError.message);
      }
    }
    
    // 2. 测试图片访问
    console.log('\n🧪 测试图片访问...');
    const testImageKey = 'temp/images/test-access.jpg';
    
    try {
      // 尝试获取一个测试文件的URL
      const testUrl = `https://${bucket}.cos.${region}.myqcloud.com/${testImageKey}`;
      console.log('测试图片URL:', testUrl);
      console.log('请在浏览器中打开此URL测试是否可访问');
      
    } catch (error) {
      console.error('❌ 测试图片访问失败:', error.message);
    }
    
    // 3. 检查CORS设置
    console.log('\n🌐 检查CORS设置...');
    try {
      const corsResult = await cos.getBucketCors({
        Bucket: bucket,
        Region: region,
      });
      
      console.log('✅ CORS设置:', corsResult.CORSRules);
      
    } catch (error) {
      console.log('⚠️ 获取CORS设置失败，可能需要设置CORS规则');
      
      // 设置基本的CORS规则
      try {
        await cos.putBucketCors({
          Bucket: bucket,
          Region: region,
          CORSRules: [
            {
              AllowedOrigin: ['*'],
              AllowedMethod: ['GET', 'HEAD'],
              AllowedHeader: ['*'],
              ExposeHeader: ['ETag'],
              MaxAgeSeconds: 3600
            }
          ]
        });
        console.log('✅ 已设置基本CORS规则');
      } catch (corsError) {
        console.error('❌ 设置CORS规则失败:', corsError.message);
      }
    }
    
    console.log('\n🎯 权限检查和修复完成！');
    console.log('💡 建议:');
    console.log('1. 在腾讯云控制台中确认存储桶权限为"公开读取"');
    console.log('2. 检查存储桶的访问策略');
    console.log('3. 确保没有IP白名单限制');
    
  } catch (error) {
    console.error('❌ 权限检查和修复失败:', error);
  }
}

checkAndFixCosPermissions();
