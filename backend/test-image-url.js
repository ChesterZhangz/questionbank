const cosService = require('./dist/services/cosService').default;

async function testImageUrl() {
  try {
    console.log('🧪 测试图片URL生成...');
    
    // 测试不同的cosKey格式
    const testCosKeys = [
      'temp/images/temp_123/abc.jpg',
      'questions/images/MT-TEST-123/def.png',
      'temp/images/temp_456/ghi.jpeg'
    ];
    
    console.log('\n📝 测试cosKey和生成的URL:');
    testCosKeys.forEach((cosKey, index) => {
      // 模拟cosService的generateImageUrl方法
      const bucket = 'mareate-1314100657';
      const region = 'ap-singapore';
      
      // 生成URL
      const url = `https://${bucket}.cos.${region}.myqcloud.com/${cosKey}`;
      
      console.log(`\n${index + 1}. cosKey: ${cosKey}`);
      console.log(`   URL: ${url}`);
      
      // 测试URL是否可访问
      console.log(`   测试访问: 请在浏览器中打开此URL测试是否可访问`);
    });
    
    console.log('\n🔍 问题诊断:');
    console.log('1. 检查图片URL是否能在浏览器中直接访问');
    console.log('2. 如果URL无法访问，可能是COS权限问题');
    console.log('3. 如果URL可以访问但前端不显示，可能是前端状态更新问题');
    
    console.log('\n💡 建议:');
    console.log('1. 复制上面的URL到浏览器测试');
    console.log('2. 检查腾讯云COS的存储桶权限设置');
    console.log('3. 确保存储桶是公开读取权限');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testImageUrl();
