const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAuthWithToken() {
  console.log('🧪 开始测试带认证token的请求...');
  
  try {
    // 1. 生成一个有效的JWT token
    console.log('\n📋 1. 生成JWT token');
    const userId = '68a3e636efec7fc9811b944d'; // 从之前的调试中获取的用户ID
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ Token生成成功:', token.substring(0, 20) + '...');
    
    // 2. 测试草稿API
    console.log('\n📋 2. 测试草稿API');
    try {
      const response = await axios.get('https://www.mareate.com/api/question-drafts/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });
      
      console.log('✅ API请求成功');
      console.log('状态码:', response.status);
      console.log('响应数据:', response.data);
      
      // 检查响应结构
      if (response.data && response.data.success && response.data.data && response.data.data.drafts) {
        console.log('✅ 响应结构正确');
        console.log('草稿数量:', response.data.data.drafts.length);
      } else {
        console.log('❌ 响应结构异常:', response.data);
      }
      
    } catch (error) {
      console.log('❌ API请求失败');
      if (error.response) {
        console.log('状态码:', error.response.status);
        console.log('响应数据:', error.response.data);
      } else {
        console.log('错误信息:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
  
  console.log('\n🏁 测试完成');
}

// 运行测试
testAuthWithToken();
