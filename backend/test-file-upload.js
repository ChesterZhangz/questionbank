const fs = require('fs');
const path = require('path');

async function testFileUpload() {
  try {
    console.log('🧪 测试文件上传功能...');
    
    // 检查后端服务器状态
    console.log('\n1️⃣ 检查后端服务器状态...');
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 后端服务器运行正常:', data);
      } else {
        console.log('❌ 后端服务器响应异常:', response.status);
        return;
      }
    } catch (error) {
      console.log('❌ 无法连接到后端服务器:', error.message);
      console.log('💡 请确保后端服务器正在运行: npm start');
      return;
    }
    
    // 检查临时图片目录
    console.log('\n2️⃣ 检查临时图片目录...');
    const tempImagesDir = path.join(process.cwd(), 'temp', 'images');
    if (fs.existsSync(tempImagesDir)) {
      const files = fs.readdirSync(tempImagesDir);
      console.log(`📊 临时图片文件数量: ${files.length}`);
      
      if (files.length > 0) {
        console.log('📋 临时图片文件列表:');
        files.forEach((file, index) => {
          const filePath = path.join(tempImagesDir, file);
          const stats = fs.statSync(filePath);
          console.log(`  ${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
      }
    } else {
      console.log('❌ 临时图片目录不存在');
    }
    
    console.log('\n📝 测试说明:');
    console.log('1. 后端服务器已启动并运行正常');
    console.log('2. 现在你可以测试图片上传功能');
    console.log('3. 上传图片时，后端会显示详细的日志信息');
    console.log('4. 如果仍然有问题，请查看后端控制台的日志');
    
    console.log('\n🚀 请在前端尝试上传图片，然后查看后端控制台输出');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFileUpload();
