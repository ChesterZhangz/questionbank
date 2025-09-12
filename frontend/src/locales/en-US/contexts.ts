export const contexts = {
  backgroundTask: {
    notifications: {
      taskCompleted: 'Task Completed',
      taskFailed: 'Task Failed',
      taskCompletedMessage: '{fileName} processing completed, identified {count} questions',
      taskFailedMessage: '{fileName} processing failed: {error}',
      unknownError: 'Unknown error'
    },
    status: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    },
    types: {
      document: 'Document Processing',
      ocr: 'OCR Recognition',
      'auto-processing': 'Auto Processing'
    }
  }
};
