export const math = {
  // OCRUploader component
  ocrUploader: {
    title: 'Upload Math Question Image',
    dragTitle: 'Release to upload image',
    description: 'Supports JPG, PNG formats, max {maxSize}MB',
    selectFile: 'Select File',
    takePhoto: 'Take Photo',
    clipboard: 'Clipboard',
    dragHint: 'Or drag and drop image here',
    dragHintWithClipboard: 'Or drag and drop image here, or paste from clipboard (Ctrl+V)',
    previewAlt: 'Question image preview',
    reselect: 'Reselect',
    clear: 'Clear',
    startRecognition: 'Start Recognition',
    recognizing: 'Recognizing...',
    recognitionSuccess: 'OCR Recognition Successful',
    copy: 'Copy',
    fileSize: '{fileName} ({fileSize}MB)',
    errors: {
      unsupportedFormat: 'Unsupported file format, please upload JPG or PNG images',
      fileTooLarge: 'File size cannot exceed {maxSize}MB',
      clipboardNotSupported: 'Browser does not support clipboard reading',
      noImageInClipboard: 'No image found in clipboard',
      clipboardReadFailed: 'Failed to read from clipboard',
      copyToClipboardFailed: 'Failed to copy to clipboard',
      ocrFailed: 'OCR recognition failed',
      copySuccess: 'Copied to clipboard'
    }
  },

  // FormulaDisplay component
  formulaDisplay: {
    renderError: 'Formula rendering error: {formula}'
  },
};
