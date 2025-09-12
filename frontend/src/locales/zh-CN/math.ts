export const math = {
  // OCRUploader 组件
  ocrUploader: {
    title: '上传数学题目图片',
    dragTitle: '释放以上传图片',
    description: '支持 JPG、PNG 格式，最大 {maxSize}MB',
    selectFile: '选择文件',
    takePhoto: '拍照',
    clipboard: '剪切板',
    dragHint: '或直接拖拽图片到此处',
    dragHintWithClipboard: '或直接拖拽图片到此处，也可以从剪切板粘贴图片 (Ctrl+V)',
    previewAlt: '题目图片预览',
    reselect: '重新选择',
    clear: '清空',
    startRecognition: '开始识别',
    recognizing: '识别中...',
    recognitionSuccess: 'OCR识别成功',
    copy: '复制',
    fileSize: '{fileName} ({fileSize}MB)',
    errors: {
      unsupportedFormat: '不支持的文件格式，请上传 JPG 或 PNG 图片',
      fileTooLarge: '文件大小不能超过 {maxSize}MB',
      clipboardNotSupported: '浏览器不支持剪切板读取功能',
      noImageInClipboard: '剪切板中没有找到图片',
      clipboardReadFailed: '读取剪切板失败',
      copyToClipboardFailed: '复制到剪切板失败',
      ocrFailed: 'OCR识别失败',
      copySuccess: '已复制到剪切板'
    }
  },

  // FormulaDisplay 组件
  formulaDisplay: {
    renderError: '公式渲染错误: {formula}'
  },
};
