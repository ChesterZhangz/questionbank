export const contexts = {
  backgroundTask: {
    notifications: {
      taskCompleted: '任务完成',
      taskFailed: '任务失败',
      taskCompletedMessage: '{fileName} 处理完成，识别到 {count} 道题目',
      taskFailedMessage: '{fileName} 处理失败: {error}',
      unknownError: '未知错误'
    },
    status: {
      pending: '等待中',
      processing: '处理中',
      completed: '已完成',
      failed: '失败'
    },
    types: {
      document: '文档处理',
      ocr: 'OCR识别',
      'auto-processing': '自动处理'
    }
  }
};
