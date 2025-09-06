// Vditor WYSIWYG 编辑器主类
import type { VditorInstance, VditorOptions } from './types';
import { VDITOR_CONSTANTS } from './types';
import { luteManager } from './lute';
import { WYSIWYGEditor } from './wysiwyg';
import { ToolbarManager } from './toolbar';
import { UndoManager } from './undo';
import { editorUtils } from './utils';
import { merge } from './utils';

export class VditorWYSIWYG {
  public vditor: VditorInstance;
  private isDestroyed = false;

  constructor(element: HTMLElement, options: Partial<VditorOptions> = {}) {
    // 合并默认选项
    const defaultOptions = this.getDefaultOptions();
    const mergedOptions = merge(defaultOptions, options) as VditorOptions;

    // 初始化vditor实例
    this.vditor = {
      currentMode: mergedOptions.mode,
      element: element,
      wysiwyg: {} as any, // 将在后面初始化
      toolbar: {} as any, // 将在后面初始化
      undo: {} as any, // 将在后面初始化
      lute: {} as any, // 将在后面初始化
      options: mergedOptions,
      hint: {} as any,
      tip: {} as any,
      outline: {} as any,
      originalInnerHTML: element.innerHTML,
    };

    this.init();
  }

  private getDefaultOptions(): VditorOptions {
    return {
      mode: 'wysiwyg',
      height: 'auto',
      width: 'auto',
      placeholder: '请输入内容...',
      theme: 'classic',
      cache: {
        enable: true,
        id: 'vditor-wysiwyg',
      },
      cdn: VDITOR_CONSTANTS.CDN,
      classes: {
        preview: '',
      },
      comment: {
        enable: false,
      },
      counter: {
        enable: false,
        type: 'markdown',
      },
      customRenders: [],
      debugger: false,
      fullscreen: {
        index: 90,
      },
      hint: {
        delay: 200,
        emoji: {
          '+1': '👍',
          '-1': '👎',
          'confused': '😕',
          'eyes': '👀️',
          'heart': '❤️',
          'rocket': '🚀️',
          'smile': '😄',
          'tada': '🎉️',
        },
        emojiPath: `${VDITOR_CONSTANTS.CDN}/dist/images/emoji`,
        extend: [],
        parse: true,
      },
      icon: 'ant',
      lang: 'zh_CN',
      outline: {
        enable: false,
        position: 'left',
      },
      preview: {
        hljs: VDITOR_CONSTANTS.HLJS_OPTIONS,
        markdown: VDITOR_CONSTANTS.MARKDOWN_OPTIONS,
        math: VDITOR_CONSTANTS.MATH_OPTIONS,
        mode: 'both',
        theme: VDITOR_CONSTANTS.THEME_OPTIONS,
      },
      link: {
        isOpen: true,
      },
      image: {
        isPreview: true,
      },
      resize: {
        enable: false,
        position: 'bottom',
      },
      toolbar: [
        'bold',
        'italic',
        'strike',
        '|',
        'link',
        'list',
        'ordered-list',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        '|',
        'table',
        '|',
        'undo',
        'redo',
        '|',
        'fullscreen',
      ],
      toolbarConfig: {
        hide: false,
        pin: false,
      },
      typewriterMode: false,
      undoDelay: 800,
      upload: {
        extraData: {},
        fieldName: 'file[]',
        filename: (name: string) => name.replace(/\W/g, ''),
        linkToImgUrl: '',
        max: 10 * 1024 * 1024,
        multiple: true,
        url: '',
        withCredentials: false,
      },
      value: '',
      rtl: false,
    };
  }

  private async init(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    try {
      // 加载Lute引擎
      await luteManager.loadLute();
      
      // 创建Lute实例
      this.vditor.lute = luteManager.createLute(this.vditor.options);
      
      // 初始化各个组件
      this.vditor.undo = new UndoManager();
      this.vditor.wysiwyg = new WYSIWYGEditor(this.vditor);
      this.vditor.toolbar = new ToolbarManager(this.vditor);
      
      // 初始化提示和目录
      this.initHint();
      this.initTip();
      this.initOutline();
      
      // 设置初始内容
      if (this.vditor.options.value) {
        this.setValue(this.vditor.options.value);
      }
      
      // 绑定全局事件
      this.bindGlobalEvents();
      
      // 调用after回调
      if (this.vditor.options.after) {
        this.vditor.options.after();
      }
      
    } catch (error) {
      console.error('Failed to initialize Vditor:', error);
    }
  }

  private initHint(): void {
    this.vditor.hint = {
      recentLanguage: '',
      render: (_vditor: VditorInstance) => {
        // 实现提示渲染逻辑
      },
    };
  }

  private initTip(): void {
    const tipElement = document.createElement('div');
    tipElement.className = 'vditor-tip';
    document.body.appendChild(tipElement);
    
    this.vditor.tip = {
      element: tipElement,
      show: (text: string, time?: number) => {
        tipElement.textContent = text;
        tipElement.style.display = 'block';
        if (time && time > 0) {
          setTimeout(() => {
            tipElement.style.display = 'none';
          }, time);
        }
      },
    };
  }

  private initOutline(): void {
    const outlineElement = document.createElement('div');
    outlineElement.className = 'vditor-outline';
    
    this.vditor.outline = {
      element: outlineElement,
      render: (vditor: VditorInstance) => {
        // 实现大纲渲染逻辑
        this.generateOutline(vditor);
      },
    };
  }

  private generateOutline(vditor: VditorInstance): void {
    const headings = vditor.wysiwyg.element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const outlineItems: any[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      
      heading.id = id;
      
      outlineItems.push({
        id,
        level,
        text,
        element: heading,
      });
    });
    
    // 渲染大纲到outline元素
    this.renderOutline(outlineItems);
  }

  private renderOutline(items: any[]): void {
    if (!this.vditor.outline) return;
    
    const outlineHTML = items.map(item => 
      `<div class="outline-item level-${item.level}">
        <a href="#${item.id}" class="outline-link">${item.text}</a>
      </div>`
    ).join('');
    
    this.vditor.outline.element.innerHTML = `
      <div class="outline-header">大纲</div>
      <div class="outline-content">${outlineHTML}</div>
    `;
  }

  private bindGlobalEvents(): void {
    // 绑定键盘快捷键
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            this.toolbarEvent('bold');
            break;
          case 'i':
            event.preventDefault();
            this.toolbarEvent('italic');
            break;
          case 'k':
            event.preventDefault();
            this.toolbarEvent('link');
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              this.vditor.undo.redo(this.vditor);
            } else {
              this.vditor.undo.undo(this.vditor);
            }
            break;
        }
      }
    });
  }

  private toolbarEvent(action: string): void {
    const button = this.vditor.toolbar.elements[action];
    if (button) {
      const event = new Event('click');
      button.dispatchEvent(event);
    }
  }

  // 公共API方法
  public getValue(): string {
    if (this.vditor.currentMode === 'wysiwyg') {
      return this.vditor.lute.VditorDOM2Md(this.vditor.wysiwyg.element.innerHTML);
    }
    return '';
  }

  public setValue(markdown: string, clearStack = false): void {
    if (this.vditor.currentMode === 'wysiwyg') {
      this.vditor.wysiwyg.element.innerHTML = this.vditor.lute.Md2VditorDOM(markdown);
      
      // 处理代码渲染
      this.vditor.wysiwyg.element.querySelectorAll('.vditor-wysiwyg__preview[data-render="2"]')
        .forEach((item: Element) => {
          editorUtils.processCodeRender(item as HTMLElement, this.vditor);
        });
    }
    
    // 生成大纲
    this.generateOutline(this.vditor);
    
    if (clearStack && this.vditor.undo) {
      this.vditor.undo.clearStack(this.vditor);
    }
  }

  public getHTML(): string {
    if (this.vditor.currentMode === 'wysiwyg') {
      return this.vditor.lute.VditorDOM2HTML(this.vditor.wysiwyg.element.innerHTML);
    }
    return '';
  }

  public focus(): void {
    if (this.vditor.currentMode === 'wysiwyg') {
      this.vditor.wysiwyg.element.focus();
    }
  }

  public blur(): void {
    if (this.vditor.currentMode === 'wysiwyg') {
      this.vditor.wysiwyg.element.blur();
    }
  }

  public disabled(): void {
    this.vditor.wysiwyg.element.setAttribute('contenteditable', 'false');
  }

  public enable(): void {
    this.vditor.wysiwyg.element.setAttribute('contenteditable', 'true');
  }

  public getSelection(): string {
    if (this.vditor.currentMode === 'wysiwyg') {
      return editorUtils.getSelectText(this.vditor.wysiwyg.element);
    }
    return '';
  }

  public getCursorPosition(): { left: number; top: number } {
    if (this.vditor.currentMode === 'wysiwyg') {
      return editorUtils.getCursorPosition(this.vditor.wysiwyg.element);
    }
    return { left: 0, top: 0 };
  }

  public insertValue(value: string, render = true): void {
    const range = editorUtils.getEditorRange(this.vditor);
    range.collapse(true);
    
    const tempElement = document.createElement('template');
    tempElement.innerHTML = value;
    range.insertNode(tempElement.content.cloneNode(true));
    range.collapse(false);
    
    if (render) {
      // 触发输入事件
      const inputEvent = new InputEvent('input', {
        inputType: 'insertText',
        data: value,
      });
      this.vditor.wysiwyg.element.dispatchEvent(inputEvent);
    }
  }

  public insertMD(md: string): void {
    if (this.vditor.currentMode === 'wysiwyg') {
      const html = this.vditor.lute.Md2VditorDOM(md);
      editorUtils.insertHTML(html, this.vditor);
    }
    
    this.generateOutline(this.vditor);
    editorUtils.execAfterRender(this.vditor);
  }

  public html2md(value: string): string {
    return this.vditor.lute.HTML2Md(value);
  }

  public exportJSON(value: string): any {
    return this.vditor.lute.RenderJSON(value);
  }

  public tip(text: string, time?: number): void {
    this.vditor.tip.show(text, time);
  }

  public clearCache(): void {
    if (this.vditor.options.cache.enable) {
      localStorage.removeItem(this.vditor.options.cache.id);
    }
  }

  public destroy(): void {
    this.vditor.element.innerHTML = this.vditor.originalInnerHTML;
    this.vditor.element.classList.remove('vditor');
    this.vditor.element.removeAttribute('style');
    
    // 清理事件监听器
    if (this.vditor.wysiwyg) {
      this.vditor.wysiwyg.unbindListener();
    }
    
    // 清理提示元素
    if (this.vditor.tip && this.vditor.tip.element) {
      document.body.removeChild(this.vditor.tip.element);
    }
    
    this.clearCache();
    this.isDestroyed = true;
  }

  public updateToolbarConfig(options: any): void {
    this.vditor.toolbar.updateConfig(this.vditor, options);
  }

  public setTheme(theme: 'dark' | 'classic', contentTheme?: string, codeTheme?: string): void {
    this.vditor.options.theme = theme;
    if (contentTheme) {
      this.vditor.options.preview.theme.current = contentTheme;
    }
    if (codeTheme) {
      this.vditor.options.preview.hljs.style = codeTheme;
    }
  }
}
