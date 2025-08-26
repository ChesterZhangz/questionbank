#!/usr/bin/env node

/**
 * 重新评估所有题目的AI分析结果
 * 使用新的reasoning模型重新生成所有题目的评价和能力维度评估
 */

const { rebuildAllEvaluations } = require('./scripts/rebuildAllEvaluations');

console.log('🚀 启动题目重新评估脚本...');
console.log('💡 这将使用新的reasoning模型重新评估所有题目');
console.log('⏰ 预计需要较长时间，请耐心等待...\n');

rebuildAllEvaluations()
  .then(() => {
    console.log('\n🎉 脚本执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
