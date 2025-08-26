const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

async function debugAuth() {
  console.log('🔍 开始调试认证流程...');
  
  try {
    // 1. 检查环境变量
    console.log('\n📋 1. 检查环境变量');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
    
    // 2. 测试数据库连接
    console.log('\n📋 2. 测试数据库连接');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB连接成功');
      
      // 3. 检查用户集合
      console.log('\n📋 3. 检查用户集合');
      const { User } = require('./dist/models/User');
      const userCount = await User.countDocuments();
      console.log('用户总数:', userCount);
      
      // 4. 检查草稿集合
      console.log('\n📋 4. 检查草稿集合');
      const QuestionDraft = require('./dist/models/QuestionDraft').default;
      const draftCount = await QuestionDraft.countDocuments();
      console.log('草稿总数:', draftCount);
      
      // 5. 检查一个具体用户
      console.log('\n📋 5. 检查具体用户');
      const sampleUser = await User.findOne().select('_id email enterpriseId');
      if (sampleUser) {
        console.log('示例用户:', {
          id: sampleUser._id,
          email: sampleUser.email,
          enterpriseId: sampleUser.enterpriseId
        });
        
        // 6. 测试JWT token生成
        console.log('\n📋 6. 测试JWT token生成');
        const token = jwt.sign(
          { userId: sampleUser._id.toString() },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        console.log('生成的token:', token.substring(0, 20) + '...');
        
        // 7. 测试JWT token验证
        console.log('\n📋 7. 测试JWT token验证');
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log('✅ Token验证成功:', decoded);
        } catch (error) {
          console.log('❌ Token验证失败:', error.message);
        }
        
        // 8. 检查该用户的草稿
        console.log('\n📋 8. 检查用户草稿');
        const userDrafts = await QuestionDraft.find({ creator: sampleUser._id });
        console.log('用户草稿数量:', userDrafts.length);
        if (userDrafts.length > 0) {
          console.log('第一个草稿:', {
            id: userDrafts[0]._id,
            name: userDrafts[0].name,
            questionsCount: userDrafts[0].questions?.length || 0
          });
        }
        
      } else {
        console.log('❌ 没有找到用户');
      }
      
    } catch (error) {
      console.log('❌ 数据库连接失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message);
  }
  
  console.log('\n🏁 调试完成');
  process.exit(0);
}

// 运行调试
debugAuth();
