// 工具栏系统
import type { VditorInstance, ToolbarInstance, ToolbarItem } from './types';
import { VDITOR_CONSTANTS } from './types';
import { editorUtils } from './utils';
import { getEventName, updateHotkeyTip } from './utils';

export class ToolbarManager implements ToolbarInstance {
  public element: HTMLElement;
  public elements: Record<string, HTMLElement> = {};

  constructor(vditor: VditorInstance) {
    this.element = this.createElement();
    this.createToolbarItems(vditor);
  }

  private createElement(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'vditor-toolbar';
    return toolbar;
  }

  private createToolbarItems(vditor: VditorInstance): void {
    vditor.options.toolbar.forEach((menuItem: string | ToolbarItem, i: number) => {
      const itemElement = this.createToolbarItem(vditor, menuItem, i);
      if (itemElement) {
        this.element.appendChild(itemElement);
      }
    });
  }

  private createToolbarItem(vditor: VditorInstance, menuItem: string | ToolbarItem, index: number): HTMLElement | null {
    const item = typeof menuItem === 'string' ? this.getDefaultToolbarItem(menuItem) : menuItem;
    if (!item) return null;

    const itemElement = document.createElement('div');
    
    if (item.className) {
      itemElement.classList.add(...item.className.split(' '));
    }

    let hotkey = item.hotkey ? ` <${updateHotkeyTip(item.hotkey)}>` : '';
    if (item.level === 2) {
      hotkey = item.hotkey ? ` &lt;${updateHotkeyTip(item.hotkey)}&gt;` : '';
    }
    
    const tip = item.tip ? item.tip + hotkey : `${item.name}${hotkey}`;
    const tagName = item.name === 'upload' ? 'div' : 'button';
    
    if (item.level === 2) {
      itemElement.innerHTML = `<${tagName} data-type="${item.name}">${tip}</${tagName}>`;
    } else {
      itemElement.classList.add('vditor-toolbar__item');
      const iconElement = document.createElement(tagName);
      iconElement.setAttribute('data-type', item.name);
      iconElement.className = `vditor-tooltipped vditor-tooltipped__${item.tipPosition || 'n'}`;
      iconElement.setAttribute('aria-label', tip);
      iconElement.innerHTML = item.icon || '';
      itemElement.appendChild(iconElement);
    }

    if (item.prefix) {
      this.bindToolbarEvent(vditor, itemElement, item);
    }

    let key = item.name;
    if (key === 'br' || key === '|') {
      key = key + index;
    }

    this.elements[key] = itemElement;
    return itemElement;
  }

  private getDefaultToolbarItem(name: string): ToolbarItem | null {
    const defaultItems: Record<string, ToolbarItem> = {
      'bold': {
        name: 'bold',
        icon: '<svg><use xlink:href="#vditor-icon-bold"></use></svg>',
        hotkey: '⌘B',
        prefix: '**',
        suffix: '**',
        tipPosition: 'ne',
      },
      'italic': {
        name: 'italic',
        icon: '<svg><use xlink:href="#vditor-icon-italic"></use></svg>',
        hotkey: '⌘I',
        prefix: '*',
        suffix: '*',
        tipPosition: 'ne',
      },
      'strike': {
        name: 'strike',
        icon: '<svg><use xlink:href="#vditor-icon-strike"></use></svg>',
        hotkey: '⌘D',
        prefix: '~~',
        suffix: '~~',
        tipPosition: 'ne',
      },
      'link': {
        name: 'link',
        icon: '<svg><use xlink:href="#vditor-icon-link"></use></svg>',
        hotkey: '⌘K',
        prefix: '[',
        suffix: '](https://)',
        tipPosition: 'n',
      },
      'list': {
        name: 'list',
        icon: '<svg><use xlink:href="#vditor-icon-list"></use></svg>',
        hotkey: '⌘L',
        prefix: '* ',
        tipPosition: 'n',
      },
      'ordered-list': {
        name: 'ordered-list',
        icon: '<svg><use xlink:href="#vditor-icon-ordered-list"></use></svg>',
        hotkey: '⌘O',
        prefix: '1. ',
        tipPosition: 'n',
      },
      'quote': {
        name: 'quote',
        icon: '<svg><use xlink:href="#vditor-icon-quote"></use></svg>',
        hotkey: '⌘;',
        prefix: '> ',
        tipPosition: 'n',
      },
      'line': {
        name: 'line',
        icon: '<svg><use xlink:href="#vditor-icon-line"></use></svg>',
        hotkey: '⇧⌘H',
        prefix: '---',
        tipPosition: 'n',
      },
      'code': {
        name: 'code',
        icon: '<svg><use xlink:href="#vditor-icon-code"></use></svg>',
        hotkey: '⌘U',
        prefix: '```',
        suffix: '\n```',
        tipPosition: 'n',
      },
      'inline-code': {
        name: 'inline-code',
        icon: '<svg><use xlink:href="#vditor-icon-inline-code"></use></svg>',
        hotkey: '⌘G',
        prefix: '`',
        suffix: '`',
        tipPosition: 'n',
      },
      'table': {
        name: 'table',
        icon: '<svg><use xlink:href="#vditor-icon-table"></use></svg>',
        hotkey: '⌘M',
        prefix: '| col1',
        suffix: ' | col2 | col3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |',
        tipPosition: 'n',
      },
      'undo': {
        name: 'undo',
        icon: '<svg><use xlink:href="#vditor-icon-undo"></use></svg>',
        hotkey: '⌘Z',
        tipPosition: 'nw',
      },
      'redo': {
        name: 'redo',
        icon: '<svg><use xlink:href="#vditor-icon-redo"></use></svg>',
        hotkey: '⌘Y',
        tipPosition: 'nw',
      },
      'fullscreen': {
        name: 'fullscreen',
        icon: '<svg><use xlink:href="#vditor-icon-fullscreen"></use></svg>',
        hotkey: "⌘'",
        tipPosition: 'nw',
      },
      '|': {
        name: '|',
      },
      'br': {
        name: 'br',
      },
    };

    return defaultItems[name] || null;
  }

  private bindToolbarEvent(vditor: VditorInstance, itemElement: HTMLElement, _item: ToolbarItem): void {
    const button = itemElement.querySelector('button, div') as HTMLElement;
    if (!button) return;

    button.addEventListener(getEventName(), (event) => {
      event.preventDefault();
      
      if (button.classList.contains(VDITOR_CONSTANTS.CLASS_MENU_DISABLED)) {
        return;
      }

      if (vditor.currentMode === 'wysiwyg') {
        this.toolbarEvent(vditor, button, event);
      }
    });
  }

  private toolbarEvent(vditor: VditorInstance, actionBtn: HTMLElement, _event: Event): void {
    if (vditor.wysiwyg.composingLock) {
      return;
    }

    const range = editorUtils.getEditorRange(vditor);
    let commandName = actionBtn.getAttribute('data-type');

    if (!commandName) return;

    // 移除现有wbr
    if (vditor.wysiwyg.element.querySelector('wbr')) {
      vditor.wysiwyg.element.querySelector('wbr')?.remove();
    }

    // 处理不同的工具栏操作
    switch (commandName) {
      case 'bold':
        this.handleBold(vditor, range, actionBtn);
        break;
      case 'italic':
        this.handleItalic(vditor, range, actionBtn);
        break;
      case 'strike':
        this.handleStrike(vditor, range, actionBtn);
        break;
      case 'link':
        this.handleLink(vditor, range, actionBtn);
        break;
      case 'list':
        this.handleList(vditor, range, actionBtn);
        break;
      case 'ordered-list':
        this.handleOrderedList(vditor, range, actionBtn);
        break;
      case 'quote':
        this.handleQuote(vditor, range, actionBtn);
        break;
      case 'line':
        this.handleLine(vditor, range, actionBtn);
        break;
      case 'code':
        this.handleCode(vditor, range, actionBtn);
        break;
      case 'inline-code':
        this.handleInlineCode(vditor, range, actionBtn);
        break;
      case 'table':
        this.handleTable(vditor, range, actionBtn);
        break;
      case 'undo':
        if (vditor.undo) {
          vditor.undo.undo(vditor);
        }
        break;
      case 'redo':
        if (vditor.undo) {
          vditor.undo.redo(vditor);
        }
        break;
      case 'fullscreen':
        this.handleFullscreen(vditor);
        break;
    }

    this.afterRenderEvent(vditor);
  }

  private handleBold(_vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      // 取消粗体
      actionBtn.classList.remove('vditor-menu--current');
      document.execCommand('bold', false);
    } else {
      // 添加粗体
      actionBtn.classList.add('vditor-menu--current');
      if (range.toString() === '') {
        const node = document.createElement('strong');
        node.textContent = VDITOR_CONSTANTS.ZWSP;
        range.insertNode(node);
        range.setStart(node.firstChild!, 1);
        range.collapse(true);
        editorUtils.setSelectionFocus(range);
      } else {
        document.execCommand('bold', false);
      }
    }
  }

  private handleItalic(_vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      document.execCommand('italic', false);
    } else {
      actionBtn.classList.add('vditor-menu--current');
      if (range.toString() === '') {
        const node = document.createElement('em');
        node.textContent = VDITOR_CONSTANTS.ZWSP;
        range.insertNode(node);
        range.setStart(node.firstChild!, 1);
        range.collapse(true);
        editorUtils.setSelectionFocus(range);
      } else {
        document.execCommand('italic', false);
      }
    }
  }

  private handleStrike(_vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      document.execCommand('strikeThrough', false);
    } else {
      actionBtn.classList.add('vditor-menu--current');
      if (range.toString() === '') {
        const node = document.createElement('s');
        node.textContent = VDITOR_CONSTANTS.ZWSP;
        range.insertNode(node);
        range.setStart(node.firstChild!, 1);
        range.collapse(true);
        editorUtils.setSelectionFocus(range);
      } else {
        document.execCommand('strikeThrough', false);
      }
    }
  }

  private handleLink(_vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      if (!range.collapsed) {
        document.execCommand('unlink', false);
      }
    } else {
      actionBtn.classList.add('vditor-menu--current');
      if (range.toString() === '') {
        const aElement = document.createElement('a');
        aElement.innerText = VDITOR_CONSTANTS.ZWSP;
        range.insertNode(aElement);
        range.setStart(aElement.firstChild!, 1);
        range.collapse(true);
        editorUtils.setSelectionFocus(range);
      } else {
        const node = document.createElement('a');
        node.setAttribute('href', '');
        node.innerHTML = range.toString();
        range.surroundContents(node);
        range.insertNode(node);
        editorUtils.setSelectionFocus(range);
      }
    }
  }

  private handleList(_vditor: VditorInstance, _range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      document.execCommand('insertUnorderedList', false);
    } else {
      actionBtn.classList.add('vditor-menu--current');
      document.execCommand('insertUnorderedList', false);
    }
  }

  private handleOrderedList(_vditor: VditorInstance, _range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      document.execCommand('insertOrderedList', false);
    } else {
      actionBtn.classList.add('vditor-menu--current');
      document.execCommand('insertOrderedList', false);
    }
  }

  private handleQuote(vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      const quoteElement = editorUtils.hasClosestByMatchTag(range.startContainer, 'BLOCKQUOTE');
      if (quoteElement) {
        quoteElement.outerHTML = quoteElement.innerHTML.trim() === '' ?
          `<p data-block="0">${quoteElement.innerHTML}</p>` : quoteElement.innerHTML;
      }
    } else {
      actionBtn.classList.add('vditor-menu--current');
      let blockElement = editorUtils.hasClosestBlock(range.startContainer);
      if (!blockElement) {
        blockElement = range.startContainer.childNodes[range.startOffset] as HTMLElement;
      }
      if (blockElement) {
        range.insertNode(document.createElement('wbr'));
        blockElement.outerHTML = `<blockquote data-block="0">${blockElement.outerHTML}</blockquote>`;
        editorUtils.setRangeByWbr(vditor.wysiwyg.element, range);
      }
    }
  }

  private handleLine(vditor: VditorInstance, range: Range, _actionBtn: HTMLElement): void {
    let blockElement = editorUtils.hasClosestBlock(range.startContainer);
    if (blockElement) {
      const hrHTML = '<hr data-block="0"><p data-block="0"><wbr>\n</p>';
      if (blockElement.innerHTML.trim() === '') {
        blockElement.outerHTML = hrHTML;
      } else {
        blockElement.insertAdjacentHTML('afterend', hrHTML);
      }
      editorUtils.setRangeByWbr(vditor.wysiwyg.element, range);
    }
  }

  private handleCode(vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    const node = document.createElement('div');
    node.className = 'vditor-wysiwyg__block';
    node.setAttribute('data-type', 'code-block');
    node.setAttribute('data-block', '0');
    node.setAttribute('data-marker', '```');
    
    if (range.toString() === '') {
      node.innerHTML = '<pre><code><wbr>\n</code></pre>';
    } else {
      node.innerHTML = `<pre><code>${range.toString()}<wbr></code></pre>`;
      range.deleteContents();
    }
    
    range.insertNode(node);
    const blockEl = editorUtils.hasClosestBlock(range.startContainer);
    if (blockEl) {
      blockEl.outerHTML = vditor.lute?.SpinVditorDOM(blockEl.outerHTML) || blockEl.outerHTML;
    }
    editorUtils.setRangeByWbr(vditor.wysiwyg.element, range);
    actionBtn.classList.add('vditor-menu--disabled');
  }

  private handleInlineCode(vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    if (actionBtn.classList.contains('vditor-menu--current')) {
      actionBtn.classList.remove('vditor-menu--current');
      const inlineCodeElement = editorUtils.hasClosestByMatchTag(range.startContainer, 'CODE');
      if (inlineCodeElement) {
        inlineCodeElement.outerHTML = inlineCodeElement.innerHTML.replace(VDITOR_CONSTANTS.ZWSP, '') + '<wbr>';
        editorUtils.setRangeByWbr(vditor.wysiwyg.element, range);
      }
    } else {
      actionBtn.classList.add('vditor-menu--current');
      if (range.toString() === '') {
        const node = document.createElement('code');
        node.textContent = VDITOR_CONSTANTS.ZWSP;
        range.insertNode(node);
        range.setStart(node.firstChild!, 1);
        range.collapse(true);
        editorUtils.setSelectionFocus(range);
      } else if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const node = document.createElement('code');
        range.surroundContents(node);
        range.insertNode(node);
        editorUtils.setSelectionFocus(range);
      }
    }
  }

  private handleTable(vditor: VditorInstance, range: Range, actionBtn: HTMLElement): void {
    let tableHTML = `<table data-block="0"><thead><tr><th>col1<wbr></th><th>col2</th><th>col3</th></tr></thead><tbody><tr><td> </td><td> </td><td> </td></tr><tr><td> </td><td> </td><td> </td></tr></tbody></table>`;
    
    if (range.toString().trim() === '') {
      let blockElement = editorUtils.hasClosestBlock(range.startContainer);
      if (blockElement && blockElement.innerHTML.trim().replace(VDITOR_CONSTANTS.ZWSP, '') === '') {
        blockElement.outerHTML = tableHTML;
      } else {
        document.execCommand('insertHTML', false, tableHTML);
      }
      const wbrElement = vditor.wysiwyg.element.querySelector('wbr');
      if (wbrElement?.previousSibling) {
        range.selectNode(wbrElement.previousSibling);
      }
      vditor.wysiwyg.element.querySelector('wbr')?.remove();
      editorUtils.setSelectionFocus(range);
    }
    
    actionBtn.classList.add('vditor-menu--disabled');
  }

  private handleFullscreen(vditor: VditorInstance): void {
    // 处理全屏
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      vditor.element.requestFullscreen();
    }
  }

  private afterRenderEvent(vditor: VditorInstance): void {
    // 渲染后事件
    if (vditor.undo) {
      vditor.undo.addToUndoStack(vditor);
    }
  }

  public updateConfig(vditor: VditorInstance, options: any): void {
    vditor.options.toolbarConfig = Object.assign({
      hide: false,
      pin: false,
    }, options);
    
    if (vditor.options.toolbarConfig.hide) {
      this.element.classList.add('vditor-toolbar--hide');
    } else {
      this.element.classList.remove('vditor-toolbar--hide');
    }
    
    if (vditor.options.toolbarConfig.pin) {
      this.element.classList.add('vditor-toolbar--pin');
    } else {
      this.element.classList.remove('vditor-toolbar--pin');
    }
  }
}
