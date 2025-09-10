import katex from 'katex';
// LaTeX元素类名
const LATEX_EDITING_CLASS = 'latex-editing';
const LATEX_RENDERED_CLASS = 'latex-rendered';
const LATEX_ERROR_CLASS = 'latex-error';

// 跟踪光标位置，用于检测移动方向
let lastCursorPosition = 0;

/**
 * 检测文本是否包含LaTeX公式
 */
export function detectLatex(text: string): boolean {
  // 宽松的检测：只要包含$符号就可能是LaTeX
  const hasInlineLatex = /\$[^$]+\$/.test(text);
  const hasBlockLatex = /\$\$[\s\S]*?\$\$/.test(text);
  return hasInlineLatex || hasBlockLatex;
}

/**
 * 检测元素是否包含LaTeX
 */
export function isLatexElement(element: HTMLElement): boolean {
  return element.classList.contains(LATEX_EDITING_CLASS) || 
         element.classList.contains(LATEX_RENDERED_CLASS);
}

/**
 * 检测元素是否是渲染的LaTeX
 */
export function isRenderedLatex(element: HTMLElement): boolean {
  return element.classList.contains(LATEX_RENDERED_CLASS);
}

/**
 * 渲染LaTeX公式
 */
export function renderLatex(element: HTMLElement): void {
  const text = element.textContent || '';
  
  if (!detectLatex(text)) {
    return;
  }

  try {
    // 保存原始文本
    element.dataset.originalText = text;
    
    // 检测是块级还是行内公式
    const isBlock = text.includes('$$');
    const latexText = text.replace(/^\$+|\$+$/g, '').trim();
    
    // 使用KaTeX渲染
    const rendered = katex.renderToString(latexText, { 
      displayMode: isBlock,
      throwOnError: false
    });
    
    // 清空所有子元素，然后插入渲染结果
    element.innerHTML = '';
    element.insertAdjacentHTML('beforeend', rendered);
    
    // 更新类名和样式
    element.classList.remove(LATEX_EDITING_CLASS);
    element.classList.add(LATEX_RENDERED_CLASS);
    
    // 设置元素为不可编辑
    element.contentEditable = 'false';
    element.setAttribute('contenteditable', 'false');
    
    // 允许光标定位到LaTeX元素，但阻止直接输入
    element.style.userSelect = 'none';
    element.style.pointerEvents = 'auto'; // 允许鼠标事件，但不允许直接输入
    
    // 为块级公式添加特殊样式
    if (isBlock) {
      element.classList.add('latex-block');
      element.style.display = 'block';
      element.style.textAlign = 'center';
      element.style.margin = '8px 0';
    } else {
      element.classList.add('latex-inline');
      element.style.display = 'inline';
    }
    
    // 渲染后确保编辑器重新获得焦点
    setTimeout(() => {
      // 确保编辑器重新获得焦点
      const editorElement = element.closest('[contenteditable="true"]') as HTMLElement;
      if (editorElement) {
        editorElement.focus();
        
        // 设置光标到LaTeX元素后面的文本节点
        const selection = window.getSelection();
        if (selection) {
          // 确保LaTeX元素后面有一个文本节点
          let nextSibling = element.nextSibling;
          if (!nextSibling || nextSibling.nodeType !== Node.TEXT_NODE) {
            const textNode = document.createTextNode('');
            element.parentNode?.insertBefore(textNode, nextSibling);
            nextSibling = textNode;
          }
          
          // 将光标设置到LaTeX元素后面的文本节点
          if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
            const range = document.createRange();
            range.setStart(nextSibling, 0);
            range.setEnd(nextSibling, 0);
            range.collapse(true);
            
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // 备用方案：设置到LaTeX元素后面
            const range = document.createRange();
            range.setStartAfter(element);
            range.setEndAfter(element);
            range.collapse(true);
            
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }, 0);
    
  } catch (error) {
    console.error('LaTeX渲染错误:', error);
    element.classList.add(LATEX_ERROR_CLASS);
  }
}

/**
 * 编辑LaTeX公式
 */
export function editLatex(element: HTMLElement): void {
  if (!isRenderedLatex(element)) {
    return;
  }

  // 恢复原始LaTeX代码
  const originalText = element.dataset.originalText || '';
  
  // 清空所有子元素，确保干净的文本节点
  element.innerHTML = '';
  
  // 创建新的文本节点
  const textNode = document.createTextNode(originalText);
  element.appendChild(textNode);
  
  // 更新类名和样式
  element.classList.remove(LATEX_RENDERED_CLASS, LATEX_ERROR_CLASS, 'latex-block', 'latex-inline');
  element.classList.add(LATEX_EDITING_CLASS);
  
  // 清除内联样式
  element.style.display = '';
  element.style.textAlign = '';
  element.style.margin = '';
  element.style.userSelect = '';
  element.style.pointerEvents = '';
  
  // 设置元素为可编辑
  element.contentEditable = 'true';
  element.setAttribute('contenteditable', 'true');
  
  // 延迟聚焦和设置光标，确保DOM更新完成
  setTimeout(() => {
    element.focus();
    
    // 设置光标位置，根据移动方向决定
    const range = document.createRange();
    const sel = window.getSelection();
    
    // 现在element.firstChild应该是我们刚创建的文本节点
    if (element.firstChild && element.firstChild.nodeType === Node.TEXT_NODE) {
      const textContent = element.firstChild.textContent || '';
      const firstDollarIndex = textContent.indexOf('$');
      const lastDollarIndex = textContent.lastIndexOf('$');
      
      if (firstDollarIndex !== -1 && lastDollarIndex !== -1) {
        // 检测光标移动方向
        const currentPosition = lastCursorPosition;
        const isMovingFromRight = currentPosition > lastDollarIndex;
        
        if (isMovingFromRight) {
          // 从右向左移动：光标设置在最后一个$的左侧
          range.setStart(element.firstChild, lastDollarIndex);
          range.setEnd(element.firstChild, lastDollarIndex);
        } else {
          // 从左向右移动：光标设置在第一个$的右侧
          range.setStart(element.firstChild, firstDollarIndex + 1);
          range.setEnd(element.firstChild, firstDollarIndex + 1);
        }
      } else {
        // 如果没有找到$，设置到文本末尾
        const textLength = textContent.length;
        range.setStart(element.firstChild, textLength);
        range.setEnd(element.firstChild, textLength);
      }
    } else {
      // 备用方案：如果文本节点不存在，重新创建
      const textNode = document.createTextNode(originalText);
      element.appendChild(textNode);
      const textContent = textNode.textContent || '';
      const firstDollarIndex = textContent.indexOf('$');
      const lastDollarIndex = textContent.lastIndexOf('$');
      
      if (firstDollarIndex !== -1 && lastDollarIndex !== -1) {
        const currentPosition = lastCursorPosition;
        const isMovingFromRight = currentPosition > lastDollarIndex;
        
        if (isMovingFromRight) {
          range.setStart(textNode, lastDollarIndex);
          range.setEnd(textNode, lastDollarIndex);
        } else {
          range.setStart(textNode, firstDollarIndex + 1);
          range.setEnd(textNode, firstDollarIndex + 1);
        }
      } else {
        range.setStart(textNode, textContent.length);
        range.setEnd(textNode, textContent.length);
      }
    }
    
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, 10);
}

/**
 * 处理LaTeX输入
 */
export function processLatexInput(element: HTMLElement): void {
  const text = element.textContent || '';
  
  if (detectLatex(text)) {
    // 标记为LaTeX编辑状态
    element.classList.add(LATEX_EDITING_CLASS);
    element.dataset.originalText = text;
  }
}

/**
 * 处理LaTeX编辑元素的输入事件
 */
export function handleLatexEditingInput(_element: HTMLElement): void {
  // 在LaTeX编辑状态下，不进行任何自动渲染
  // 只有在失去焦点时才渲染
  return;
}

/**
 * 处理编辑器内容，检测并标记LaTeX
 */
export function processEditorContent(editorElement: HTMLElement): void {
  // 检查是否有任何LaTeX编辑元素正在被编辑，如果有则跳过处理
  const activeElement = document.activeElement;
  if (activeElement && activeElement.classList.contains(LATEX_EDITING_CLASS)) {
    return;
  }
  
  // 检查光标是否在LaTeX编辑元素内
  if (isCursorInLatexEditing()) {
    return;
  }

  const walker = document.createTreeWalker(
    editorElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // 跳过已经在LaTeX元素内的文本节点
        const parent = node.parentElement;
        if (parent && (parent.classList.contains(LATEX_EDITING_CLASS) || 
                      parent.classList.contains(LATEX_RENDERED_CLASS))) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  textNodes.forEach(textNode => {
    const text = textNode.textContent || '';
    if (detectLatex(text)) {
      // 检查是否包含混合内容（文本+LaTeX）
      // 简单检测：如果文本包含LaTeX但不是纯LaTeX，就是混合内容
      const isPureLatex = /^\s*\$+[\s\S]*?\$+\s*$/.test(text);
      const hasMixedContent = !isPureLatex && detectLatex(text);
      
      if (hasMixedContent) {
        // 处理混合内容，需要正确分割文本和LaTeX部分
        const parts: Array<{type: 'text' | 'latex', content: string, isBlock?: boolean}> = [];
        let remainingText = text;
        
        // 先处理块级公式
        remainingText = remainingText.replace(/\$\$([\s\S]*?)\$\$/g, (match, _content) => {
          parts.push({type: 'latex', content: match, isBlock: true});
          return `__LATEX_BLOCK_${parts.length - 1}__`;
        });
        
        // 再处理行内公式
        remainingText = remainingText.replace(/\$([^$]+)\$/g, (match, _content) => {
          parts.push({type: 'latex', content: match, isBlock: false});
          return `__LATEX_INLINE_${parts.length - 1}__`;
        });
        
        // 按顺序处理文本和LaTeX
        const textParts = remainingText.split(/(__LATEX_(?:BLOCK|INLINE)_\d+__)/);
        
        const tempDiv = document.createElement('div');
        
        textParts.forEach(part => {
          if (part.startsWith('__LATEX_')) {
            // 这是一个LaTeX占位符
            const match = part.match(/__LATEX_(?:BLOCK|INLINE)_(\d+)__/);
            if (match) {
              const index = parseInt(match[1]);
              const latexPart = parts[index];
              if (latexPart) {
                const latexElement = document.createElement('span');
                latexElement.textContent = latexPart.content;
                latexElement.classList.add(LATEX_EDITING_CLASS);
                latexElement.dataset.originalText = latexPart.content;
                if (latexPart.isBlock) {
                  latexElement.classList.add('latex-block');
                } else {
                  latexElement.classList.add('latex-inline');
                }
                tempDiv.appendChild(latexElement);
                
                // 不立即渲染，让用户继续编辑
              }
            }
          } else if (part.trim()) {
            // 这是普通文本
            const textNode = document.createTextNode(part);
            tempDiv.appendChild(textNode);
          }
        });
        
        // 替换文本节点
        const parent = textNode.parentNode;
        if (parent) {
          // 先插入所有元素
          while (tempDiv.firstChild) {
            parent.insertBefore(tempDiv.firstChild, textNode);
          }
          
          // 在最后一个LaTeX元素后面创建一个空的文本节点
          const lastLatexElement = parent.querySelector('.latex-editing:last-of-type');
          if (lastLatexElement) {
            const textNodeAfter = document.createTextNode('');
            lastLatexElement.parentNode?.insertBefore(textNodeAfter, lastLatexElement.nextSibling);
          }
          
          parent.removeChild(textNode);
        }
      } else {
        // 纯LaTeX内容，直接替换但保持编辑状态
        const latexElement = document.createElement('span');
        latexElement.textContent = text;
        latexElement.classList.add(LATEX_EDITING_CLASS);
        latexElement.dataset.originalText = text;
        
        // 在LaTeX元素后面创建一个空的文本节点，确保光标有地方放置
        const textNodeAfter = document.createTextNode('');
        
        textNode.parentNode?.replaceChild(latexElement, textNode);
        latexElement.parentNode?.insertBefore(textNodeAfter, latexElement.nextSibling);
        
        // 不立即渲染，让用户继续编辑
        // 只有在用户明确退出编辑状态时才渲染
      }
    }
  });
}

/**
 * 检查光标是否在LaTeX编辑元素内
 */
function isCursorInLatexEditing(): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }
  
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  
  // 检查光标是否在LaTeX编辑元素内
  let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
  while (element) {
    if (element.classList && element.classList.contains(LATEX_EDITING_CLASS)) {
      return true;
    }
    element = element.parentElement;
  }
  
  return false;
}

/**
 * 处理光标在LaTeX渲染元素中的定位
 */
// handleCursorInRenderedLatex函数已删除，因为它导致了远距离LaTeX编辑的问题

/**
 * 检查光标是否在LaTeX边界之外（第一个$前或第二个$后）
 */
function isCursorOutsideLatexBoundary(): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }
  
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const offset = range.startOffset;
  
  // 检查光标是否在LaTeX编辑元素内
  let latexElement: Element | null = null;
  let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
  while (element) {
    if (element.classList && element.classList.contains(LATEX_EDITING_CLASS)) {
      latexElement = element;
      break;
    }
    element = element.parentElement;
  }
  
  if (!latexElement) {
    return false;
  }
  
  // 检查光标是否在第一个$前或第二个$后
  if (container.nodeType === Node.TEXT_NODE && container.parentElement === latexElement) {
    const textContent = container.textContent || '';
    
    // 找到第一个$的位置
    const firstDollarIndex = textContent.indexOf('$');
    if (firstDollarIndex === -1) {
      return false; // 没有找到$符号
    }
    
    // 找到最后一个$的位置
    const lastDollarIndex = textContent.lastIndexOf('$');
    if (lastDollarIndex === -1) {
      return false; // 没有找到$符号
    }
    
    // 检查光标是否在第一个$前（不包括第一个$本身）
    if (offset < firstDollarIndex) {
      return true; // 光标在第一个$前
    }
    
    // 检查光标是否在最后一个$后（不包括最后一个$本身）
    if (offset > lastDollarIndex) {
      // 如果光标在最后一个$后，总是退出编辑状态
      // 无论是从右向左移动还是输入内容
      return true;
    }
  }
  
  return false;
}

/**
 * 实时渲染LaTeX（在输入时）
 */
export function renderLatexInRealTime(_editorElement: HTMLElement): void {
  // 完全禁用实时渲染，只在用户明确离开编辑状态时才渲染
  // 这样可以避免在LaTeX编辑过程中自动渲染导致失焦
  return;
}

/**
 * 设置LaTeX事件监听器
 */
export function setupLatexHandling(editorElement: HTMLElement): void {
  // 处理输入事件 - 检测LaTeX
  let inputTimeout: ReturnType<typeof setTimeout> | null = null;
  
  editorElement.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    const activeElement = document.activeElement;
    
    // 更新光标位置跟踪
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preRange = document.createRange();
      preRange.setStart(editorElement, 0);
      preRange.setEnd(range.startContainer, range.startOffset);
      lastCursorPosition = preRange.toString().length;
    }
    
    // 如果当前焦点在LaTeX编辑元素内，检查是否需要退出编辑状态
    if (target && target.classList.contains(LATEX_EDITING_CLASS)) {
      // 检查光标是否在LaTeX边界之外
      if (isCursorOutsideLatexBoundary()) {
        // 光标在边界之外，渲染LaTeX并退出编辑状态
        // 保存当前光标位置
        const selection = window.getSelection();
        let savedCursorPosition = 0;
        
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // 计算光标在整个编辑器内容中的位置
          const preRange = document.createRange();
          preRange.setStart(editorElement, 0);
          preRange.setEnd(range.startContainer, range.startOffset);
          savedCursorPosition = preRange.toString().length;
        }
        
        renderLatex(target);
        
        // 恢复光标位置
        if (savedCursorPosition > 0 && selection) {
          setTimeout(() => {
            try {
              // 使用保存的位置重新计算光标位置
              const walker = document.createTreeWalker(
                editorElement,
                NodeFilter.SHOW_TEXT,
                null
              );
              
              let currentPos = 0;
              let targetNode = null;
              let targetOffset = 0;
              
              let node;
              while (node = walker.nextNode()) {
                const nodeLength = node.textContent?.length || 0;
                if (currentPos + nodeLength >= savedCursorPosition) {
                  targetNode = node;
                  targetOffset = savedCursorPosition - currentPos;
                  break;
                }
                currentPos += nodeLength;
              }
              
              if (targetNode) {
                const newRange = document.createRange();
                newRange.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              } else {
                // 如果找不到合适的文本节点，在编辑器末尾设置光标
                const newRange = document.createRange();
                newRange.selectNodeContents(editorElement);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } catch (error) {
              console.warn('无法恢复光标位置:', error);
              // 确保编辑器重新获得焦点
              editorElement.focus();
            }
          }, 0);
        }
        return;
      }
      return;
    }
    
    // 如果当前焦点在LaTeX渲染元素内，不处理
    if (target && target.classList.contains(LATEX_RENDERED_CLASS)) {
      return;
    }
    
    // 检查当前焦点是否在任何LaTeX编辑元素内
    if (activeElement && activeElement.classList.contains(LATEX_EDITING_CLASS)) {
      return;
    }
    
    // 检查光标是否在LaTeX编辑元素内
    if (isCursorInLatexEditing()) {
      return;
    }
    
    // 检查是否有任何LaTeX编辑元素正在被编辑
    const editingElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}`);
    for (let i = 0; i < editingElements.length; i++) {
      if (editingElements[i] === activeElement) {
        return;
      }
    }
    
    // 检查是否有任何LaTeX编辑元素正在被编辑（更严格的检查）
    const isEditingLatex = Array.from(editingElements).some(el => 
      el === activeElement || el.contains(activeElement)
    );
    if (isEditingLatex) {
      return;
    }
    
    // 检查是否是回车键触发的输入事件
    const isEnterKey = (e as any).inputType === 'insertLineBreak' || 
                      (e as any).inputType === 'insertParagraph' ||
                      (e as any).data === null; // 回车键通常data为null
    
    // 如果是回车键，延迟更长时间，让浏览器完成换行操作
    const delay = isEnterKey ? 100 : 300;
    
    // 清除之前的定时器
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // 延迟处理，给用户足够时间完成输入
    inputTimeout = setTimeout(() => {
      // 再次检查光标位置，确保用户没有在输入LaTeX
      if (!isCursorInLatexEditing() && document.activeElement !== activeElement) {
        return; // 如果焦点已经改变，不处理
      }
      
      // 如果是回车键，检查是否需要处理LaTeX，但不要恢复光标位置
      if (isEnterKey) {
        // 只处理LaTeX检测，不恢复光标位置
        processEditorContent(editorElement);
        return;
      }
      
      // 保存当前光标位置
      const selection = window.getSelection();
      let savedCursorPosition = 0;
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // 计算光标在整个编辑器内容中的位置
        const preRange = document.createRange();
        preRange.setStart(editorElement, 0);
        preRange.setEnd(range.startContainer, range.startOffset);
        savedCursorPosition = preRange.toString().length;
      }
      
      // 处理LaTeX
      processEditorContent(editorElement);
      
      // 恢复光标位置（非回车键情况）
      if (savedCursorPosition > 0 && selection) {
        try {
          // 创建一个新的范围来遍历所有文本节点
          const walker = document.createTreeWalker(
            editorElement,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let currentPosition = 0;
          let targetNode: Node | null = null;
          let targetOffset = 0;
          
          let node;
          while (node = walker.nextNode()) {
            const textLength = node.textContent?.length || 0;
            
            if (currentPosition + textLength >= savedCursorPosition) {
              targetNode = node;
              targetOffset = savedCursorPosition - currentPosition;
              break;
            }
            
            currentPosition += textLength;
          }
          
          if (targetNode) {
            const newRange = document.createRange();
            newRange.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
            newRange.setEnd(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
            
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
            // 如果找不到目标位置，在编辑器末尾设置光标
            const newRange = document.createRange();
            newRange.selectNodeContents(editorElement);
            newRange.collapse(false);
            
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } catch (error) {
          // 如果恢复失败，在编辑器末尾设置光标
          const newRange = document.createRange();
          newRange.selectNodeContents(editorElement);
          newRange.collapse(false);
          
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }, delay);
  });

  // 处理失去焦点事件 - 立即渲染LaTeX
  editorElement.addEventListener('blur', (e) => {
    const target = e.target as HTMLElement;
    // 如果失去焦点的是LaTeX编辑元素，渲染它
    if (target && target.classList.contains(LATEX_EDITING_CLASS)) {
      // 延迟渲染，避免立即失焦
      setTimeout(() => {
        renderLatex(target);
      }, 10);
    } else {
      // 检查是否有LaTeX编辑元素需要渲染
      const editingElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}`);
      if (editingElements.length > 0) {
        // 只渲染非当前焦点的LaTeX编辑元素
        editingElements.forEach(el => {
          if (el !== target && el.classList.contains(LATEX_EDITING_CLASS)) {
            renderLatex(el as HTMLElement);
          }
        });
      }
    }
  }, true);

  // 处理焦点事件 - 当光标进入LaTeX区域时自动编辑
  editorElement.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target && isRenderedLatex(target)) {
      // 避免重复编辑
      if (!target.classList.contains(LATEX_EDITING_CLASS)) {
        editLatex(target);
      }
    }
  }, true);

  // 注释掉有问题的键盘导航逻辑 - 这个监听器导致了远距离LaTeX编辑的问题
  // 现在只依赖keydown事件监听器中的更精确的逻辑

  // 处理光标位置变化 - 检测是否离开LaTeX编辑区域
  editorElement.addEventListener('keyup', (_e) => {
    // 检查是否有LaTeX编辑元素
    const editingElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}`);
    if (editingElements.length === 0) {
      return;
    }

    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // 检查光标是否在任何LaTeX编辑元素内
      let isInLatexEditing = false;
      let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
      while (element && element !== editorElement) {
        if (element.classList.contains(LATEX_EDITING_CLASS)) {
          isInLatexEditing = true;
          break;
        }
        element = element.parentElement;
      }

      // 检查光标是否在LaTeX边界之外（第一个$前或第二个$后）
      const isOutsideBoundary = isCursorOutsideLatexBoundary();

      // 如果光标不在任何LaTeX编辑元素内，或者光标在LaTeX边界之外，渲染所有LaTeX编辑元素
      if (!isInLatexEditing || isOutsideBoundary) {
        editingElements.forEach(el => {
          if (el.classList.contains(LATEX_EDITING_CLASS)) {
            renderLatex(el as HTMLElement);
          }
        });
      }
    }, 0);
  });

  // 处理鼠标悬停事件 - 编辑LaTeX
  editorElement.addEventListener('mouseenter', (e) => {
    const target = e.target as HTMLElement;
    if (target && isRenderedLatex(target)) {
      // 避免重复编辑
      if (!target.classList.contains(LATEX_EDITING_CLASS)) {
        editLatex(target);
      }
    }
  }, true);

  // 处理选择变化事件 - 检测光标是否离开LaTeX编辑区域
  document.addEventListener('selectionchange', () => {
    // 检查是否有LaTeX编辑元素
    const editingElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}`);
    if (editingElements.length === 0) {
      return;
    }

    // 延迟处理，避免与点击事件冲突
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // 检查光标是否在任何LaTeX编辑元素内
      let isInLatexEditing = false;
      let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
      while (element && element !== editorElement) {
        if (element.classList.contains(LATEX_EDITING_CLASS)) {
          isInLatexEditing = true;
          break;
        }
        element = element.parentElement;
      }

      // 检查光标是否在LaTeX边界之外（第一个$前或第二个$后）
      const isOutsideBoundary = isCursorOutsideLatexBoundary();

      // 如果光标不在任何LaTeX编辑元素内，或者光标在LaTeX边界之外，渲染所有LaTeX编辑元素
      if (!isInLatexEditing || isOutsideBoundary) {
        editingElements.forEach(el => {
          if (el.classList.contains(LATEX_EDITING_CLASS)) {
            renderLatex(el as HTMLElement);
          }
        });
      }
    }, 100); // 延迟100ms，给点击事件足够时间完成
  });

  // 处理点击事件 - 确保LaTeX元素可编辑
  editorElement.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target && isRenderedLatex(target)) {
      // 避免重复编辑
      if (!target.classList.contains(LATEX_EDITING_CLASS)) {
        e.preventDefault();
        e.stopPropagation();
        
        // 点击LaTeX元素时，先渲染所有其他LaTeX编辑元素
        const editingElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}`);
        editingElements.forEach(el => {
          if (el !== target && el.classList.contains(LATEX_EDITING_CLASS)) {
            renderLatex(el as HTMLElement);
          }
        });
        
        // 然后编辑当前LaTeX元素
        editLatex(target);
      }
    }
  });

  // 处理键盘事件 - 在LaTeX编辑状态下按Enter键渲染，以及键盘导航
  editorElement.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains(LATEX_EDITING_CLASS)) {
      if (e.key === 'Enter') {
        e.preventDefault();
        renderLatex(target);
      }
      return;
    }
    
    // 键盘导航：只有在紧邻LaTeX元素时才自动进入编辑状态
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // 延迟检查，确保光标位置已经更新
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // 只检查光标是否紧邻LaTeX元素，移除远距离检测逻辑
          const allLatexElements = editorElement.querySelectorAll(`.${LATEX_RENDERED_CLASS}`);
          allLatexElements.forEach(latexElement => {
            // 检查光标是否在LaTeX元素的前后
            const rangeStart = range.startContainer;
            const rangeEnd = range.endContainer;
            
            // 检查光标是否紧邻LaTeX元素
            const isAtLatexEnd = rangeStart === latexElement.nextSibling || rangeEnd === latexElement.nextSibling;
            const isAtLatexStart = rangeStart === latexElement.previousSibling || rangeEnd === latexElement.previousSibling;
            
            if (isAtLatexEnd || isAtLatexStart) {
              // 检查移动方向
              const isMovingFromRight = e.key === 'ArrowLeft';
              
              // 只有在LaTeX元素右侧且从右向左移动时才进入编辑状态
              if (isAtLatexEnd && isMovingFromRight) {
                editLatex(latexElement as HTMLElement);
              }
            }
          });
        }
      }, 10);
    }
  });
}

/**
 * 清理嵌套的LaTeX元素
 */
export function cleanupNestedLatex(editorElement: HTMLElement): void {
  const latexElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}, .${LATEX_RENDERED_CLASS}`);
  
  latexElements.forEach(element => {
    const parent = element.parentElement;
    if (parent && (parent.classList.contains(LATEX_EDITING_CLASS) || 
                   parent.classList.contains(LATEX_RENDERED_CLASS))) {
      // 如果父元素也是LaTeX元素，将内容移到父元素
      const content = element.textContent || element.innerHTML;
      parent.innerHTML = content;
      parent.dataset.originalText = content;
    }
  });
}

/**
 * 渲染所有LaTeX元素
 */
export function renderAllLatex(editorElement: HTMLElement): void {
  // 先清理嵌套的LaTeX元素
  cleanupNestedLatex(editorElement);
  
  const latexElements = editorElement.querySelectorAll(`.${LATEX_EDITING_CLASS}`);
  latexElements.forEach(element => {
    renderLatex(element as HTMLElement);
  });
}

/**
 * 插入LaTeX公式
 */
export function insertLatex(editorElement: HTMLElement, latexText: string, isBlock: boolean = false): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const formattedText = isBlock ? `$$${latexText}$$` : `$${latexText}$`;
  
  // 创建LaTeX元素
  const latexElement = document.createElement('span');
  latexElement.textContent = formattedText;
  latexElement.classList.add(LATEX_EDITING_CLASS);
  latexElement.dataset.originalText = formattedText;
  
  // 插入到编辑器
  range.deleteContents();
  range.insertNode(latexElement);
  range.collapse(false);
  
  // 更新选择
  selection.removeAllRanges();
  selection.addRange(range);
  
  // 聚焦到编辑器
  editorElement.focus();
}
