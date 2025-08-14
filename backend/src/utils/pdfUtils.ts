/**
 * PDF工具函数
 * 提供PDF相关的通用功能
 */

/**
 * 将PDF文本分割为页面
 * @param fullText PDF的完整文本内容
 * @returns 分割后的页面数组
 */
export function splitPDFIntoPages(fullText: string): string[] {
  // 尝试按页面分隔符分割
  const pageSeparators = [
    /\f/g, // 换页符
    /\n\s*第\s*\d+\s*页\s*\n/g,
    /\n\s*Page\s*\d+\s*\n/g,
    /\n\s*-\s*\d+\s*-\s*\n/g
  ];
  
  let pages: string[] = [];
  
  for (const separator of pageSeparators) {
    const split = fullText.split(separator);
    if (split.length > 1) {
      pages = split.filter(page => page.trim().length > 0);
      console.log(`按分隔符分割得到 ${pages.length} 页`);
      break;
    }
  }
  
  // 如果没有找到页面分隔符，按行数分割
  if (pages.length <= 1) {
    const lines = fullText.split('\n');
    const linesPerPage = Math.ceil(lines.length / 3); // 假设平均3页
    pages = [];
    
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageLines = lines.slice(i, i + linesPerPage);
      pages.push(pageLines.join('\n'));
    }
    
    console.log(`按行数分割得到 ${pages.length} 页，每页约 ${linesPerPage} 行`);
  }
  
  return pages;
}

/**
 * 从页面内容中提取指定区域的内容
 * @param pageContent 页面内容
 * @param area 区域信息
 * @returns 提取的内容
 */
export function extractContentFromArea(pageContent: string, area: any): string {
  const lines = pageContent.split('\n').filter((line: string) => line.trim());
  const totalLines = lines.length;
  
  if (totalLines === 0) return '';
  
  // 更精确的坐标映射算法
  // 考虑前端缩放和实际页面尺寸
  const estimatedPageHeight = 1000; // 估计的页面高度（像素）
  const estimatedPageWidth = 800;   // 估计的页面宽度（像素）
  
  // 计算区域在页面中的相对位置（0-1范围）
  const relativeY = Math.max(0, Math.min(1, area.y / estimatedPageHeight));
  const relativeHeight = Math.max(0, Math.min(1, area.height / estimatedPageHeight));
  const relativeX = Math.max(0, Math.min(1, area.x / estimatedPageWidth));
  const relativeWidth = Math.max(0, Math.min(1, area.width / estimatedPageWidth));
  
  // 计算对应的行范围
  const startLineIndex = Math.floor(relativeY * totalLines);
  const endLineIndex = Math.floor((relativeY + relativeHeight) * totalLines);
  
  // 确保索引在有效范围内
  const safeStart = Math.max(0, Math.min(startLineIndex, totalLines - 1));
  const safeEnd = Math.max(safeStart, Math.min(endLineIndex, totalLines));
  
  // 提取指定行范围的内容
  const extractedLines = lines.slice(safeStart, safeEnd);
  
  // 如果区域太窄，可能需要进一步过滤内容
  let extractedText = extractedLines.join('\n');
  
  // 如果区域宽度很小，尝试按字符位置过滤
  if (relativeWidth < 0.3) {
    // 对于窄区域，尝试按字符位置过滤
    const filteredLines = extractedLines.map(line => {
      const lineLength = line.length;
      const startChar = Math.floor(relativeX * lineLength);
      const endChar = Math.floor((relativeX + relativeWidth) * lineLength);
      return line.substring(startChar, endChar);
    });
    extractedText = filteredLines.join('\n');
  }
  
  console.log(`区域提取详情:`);
  console.log(`- 页面总行数: ${totalLines}`);
  console.log(`- 相对位置: Y=${relativeY.toFixed(3)}, 高度=${relativeHeight.toFixed(3)}`);
  console.log(`- 相对位置: X=${relativeX.toFixed(3)}, 宽度=${relativeWidth.toFixed(3)}`);
  console.log(`- 行范围: ${safeStart}-${safeEnd}，共${extractedLines.length}行`);
  console.log(`- 提取内容长度: ${extractedText.length}字符`);
  
  return extractedText;
} 