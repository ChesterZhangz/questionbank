const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mareate-question-bank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Question = require('../dist/models/Question').Question;

async function fixQuestionMediaData() {
  try {
    console.log('开始修复题目媒体数据...');
    
    // 查找所有题目
    const questions = await Question.find({});
    console.log(`找到 ${questions.length} 道题目`);
    
    let fixedCount = 0;
    
    for (const question of questions) {
      let needsUpdate = false;
      const updateData = {};
      
      // 修复图片数据
      if (question.images && question.images.length > 0) {
        const fixedImages = question.images.map(image => {
          const fixedImage = { ...image.toObject() };
          
          if (!fixedImage.bid) {
            fixedImage.bid = question.bid;
            needsUpdate = true;
          }
          
          if (!fixedImage.uploadedBy) {
            fixedImage.uploadedBy = question.creator.toString();
            needsUpdate = true;
          }
          
          if (!fixedImage.uploadedAt) {
            fixedImage.uploadedAt = new Date();
            needsUpdate = true;
          }
          
          return fixedImage;
        });
        
        if (needsUpdate) {
          updateData.images = fixedImages;
        }
      }
      
      // 修复TikZ数据
      if (question.tikzCodes && question.tikzCodes.length > 0) {
        const fixedTikzCodes = question.tikzCodes.map(tikz => {
          const fixedTikz = { ...tikz.toObject() };
          
          if (!fixedTikz.bid) {
            fixedTikz.bid = question.bid;
            needsUpdate = true;
          }
          
          if (!fixedTikz.createdBy) {
            fixedTikz.createdBy = question.creator.toString();
            needsUpdate = true;
          }
          
          if (!fixedTikz.createdAt) {
            fixedTikz.createdAt = new Date();
            needsUpdate = true;
          }
          
          return fixedTikz;
        });
        
        if (needsUpdate) {
          updateData.tikzCodes = fixedTikzCodes;
        }
      }
      
      // 更新题目
      if (needsUpdate) {
        await Question.findByIdAndUpdate(question._id, updateData, { runValidators: false });
        fixedCount++;
        console.log(`修复题目 ${question.qid}`);
      }
    }
    
    console.log(`修复完成！共修复了 ${fixedCount} 道题目`);
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixQuestionMediaData();
