// Vditor WYSIWYG 工具函数
import type { VditorInstance, EditorUtils } from './types';
import { VDITOR_CONSTANTS } from './types';

export const editorUtils: EditorUtils = {
  // 获取编辑器范围
  getEditorRange: (vditor: VditorInstance): Range => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return vditor.wysiwyg.element.ownerDocument.createRange();
  },

  // 通过wbr设置范围
  setRangeByWbr: (element: HTMLElement, range: Range): void => {
    const wbr = element.querySelector('wbr');
    if (wbr) {
      range.setStartBefore(wbr);
      range.setEndBefore(wbr);
      range.collapse(true);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  },

  // 设置选择焦点
  setSelectionFocus: (range: Range): void => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  },

  // 获取光标位置
  getCursorPosition: (element: HTMLElement): { left: number; top: number } => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { left: 0, top: 0 };
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return {
      left: rect.left - elementRect.left,
      top: rect.top - elementRect.top,
    };
  },

  // 获取选中文本
  getSelectText: (_element: HTMLElement): string => {
    const selection = window.getSelection();
    if (!selection) {
      return '';
    }
    return selection.toString();
  },

  // 查找最近的块元素
  hasClosestBlock: (node: Node): HTMLElement | null => {
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    
    while (element && element !== document.body) {
      if (element.getAttribute && element.getAttribute('data-block') === '0') {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  },

  // 通过标签名查找最近的元素
  hasClosestByMatchTag: (node: Node, tagName: string): HTMLElement | null => {
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    
    while (element && element !== document.body) {
      if (element.tagName && element.tagName.toLowerCase() === tagName.toLowerCase()) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  },

  // 通过属性查找最近的元素
  hasClosestByAttribute: (node: Node, attribute: string, value: string): HTMLElement | null => {
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    
    while (element && element !== document.body) {
      if (element.getAttribute && element.getAttribute(attribute) === value) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  },

  // 通过类名查找最近的元素
  hasClosestByClassName: (node: Node, className: string): HTMLElement | null => {
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    
    while (element && element !== document.body) {
      if (element.classList && element.classList.contains(className)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  },

  // 通过标题查找最近的元素
  hasClosestByHeadings: (node: Node): HTMLElement | null => {
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    
    while (element && element !== document.body) {
      if (element.tagName && /^H[1-6]$/.test(element.tagName)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  },

  // 获取顶级列表元素
  getTopList: (node: Node): HTMLElement | null => {
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    
    while (element && element !== document.body) {
      if (element.tagName && (element.tagName === 'UL' || element.tagName === 'OL')) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  },

  // 处理代码渲染
  processCodeRender: (element: HTMLElement, _vditor: VditorInstance): void => {
    // 这里可以添加代码高亮逻辑
    // 暂时简单处理
    if (element.classList.contains('vditor-wysiwyg__preview')) {
      element.setAttribute('data-rendered', 'true');
    }
  },

  // 渲染目录
  renderToc: (vditor: VditorInstance): void => {
    // 这里可以添加目录生成逻辑
    // 暂时简单处理
    if (vditor.outline) {
      vditor.outline.render(vditor);
    }
  },

  // 渲染后事件
  afterRenderEvent: (vditor: VditorInstance, options: any = {}): void => {
    // 这里可以添加渲染后的处理逻辑
    // 暂时简单处理
    if (options.enableAddUndoStack && vditor.undo) {
      vditor.undo.addToUndoStack(vditor);
    }
  },

  // 执行渲染后操作
  execAfterRender: (vditor: VditorInstance, options: any = {}): void => {
    // 这里可以添加渲染后的操作
    if (options.enableAddUndoStack && vditor.undo) {
      vditor.undo.addToUndoStack(vditor);
    }
  },

  // 插入HTML
  insertHTML: (html: string, vditor: VditorInstance): void => {
    const range = editorUtils.getEditorRange(vditor);
    const tempElement = document.createElement('template');
    tempElement.innerHTML = html;
    range.insertNode(tempElement.content.cloneNode(true));
    range.collapse(false);
    editorUtils.setSelectionFocus(range);
  },

  // 滚动到中心
  scrollCenter: (vditor: VditorInstance): void => {
    const element = vditor.wysiwyg.element;
    const rect = element.getBoundingClientRect();
    const scrollTop = element.scrollTop + (rect.height / 2) - (window.innerHeight / 2);
    element.scrollTop = Math.max(0, scrollTop);
  },
};

// 浏览器兼容性检测
export const isFirefox = (): boolean => {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isChrome = (): boolean => {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

// 键盘事件检测
export const isCtrl = (event: KeyboardEvent): boolean => {
  return event.ctrlKey || event.metaKey;
};

// 获取事件名称
export const getEventName = (): string => {
  return 'click';
};

// 更新快捷键提示
export const updateHotkeyTip = (hotkey: string): string => {
  return hotkey.replace('⌘', isMac() ? '⌘' : 'Ctrl');
};

// 检测是否为Mac
export const isMac = (): boolean => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

// 日志函数
export const log = (type: string, content: any, level: 'argument' | 'result', enableDebug: boolean): void => {
  if (enableDebug) {
    console.log(`[${type}] ${level}:`, content);
  }
};

// 合并对象
export const merge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = merge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

// 检查本地存储可用性
export const accessLocalStorage = (): boolean => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// 插入HTML
export const insertHTML = (html: string, vditor: VditorInstance): void => {
  const range = editorUtils.getEditorRange(vditor);
  const tempElement = document.createElement('template');
  tempElement.innerHTML = html;
  range.insertNode(tempElement.content.cloneNode(true));
  range.collapse(false);
  editorUtils.setSelectionFocus(range);
};

// 获取选择位置
export const getSelectPosition = (blockElement: HTMLElement, _wysiwygElement: HTMLElement, range: Range): { start: number; end: number } => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { start: 0, end: 0 };
  }

  const rangeClone = range.cloneRange();
  rangeClone.selectNodeContents(blockElement);
  rangeClone.setEnd(range.startContainer, range.startOffset);
  
  return {
    start: rangeClone.toString().length,
    end: range.toString().length,
  };
};

// 滚动到中心
export const scrollCenter = (vditor: VditorInstance): void => {
  const element = vditor.wysiwyg.element;
  const rect = element.getBoundingClientRect();
  const scrollTop = element.scrollTop + (rect.height / 2) - (window.innerHeight / 2);
  element.scrollTop = Math.max(0, scrollTop);
};

// 执行渲染后操作
export const execAfterRender = (vditor: VditorInstance, options: any = {}): void => {
  // 这里可以添加渲染后的操作
  if (options.enableAddUndoStack && vditor.undo) {
    vditor.undo.addToUndoStack(vditor);
  }
};

// 插入空块
export const insertEmptyBlock = (vditor: VditorInstance, position: 'before' | 'after'): void => {
  const range = editorUtils.getEditorRange(vditor);
  const emptyBlock = document.createElement('p');
  emptyBlock.setAttribute('data-block', '0');
  emptyBlock.innerHTML = `${VDITOR_CONSTANTS.ZWSP}<wbr>`;
  
  if (position === 'before') {
    range.insertNode(emptyBlock);
  } else {
    range.insertNode(emptyBlock);
    range.setStartAfter(emptyBlock);
    range.collapse(true);
  }
  
  editorUtils.setSelectionFocus(range);
};
