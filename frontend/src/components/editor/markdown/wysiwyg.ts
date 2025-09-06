// WYSIWYG编辑器核心组件
import type { VditorInstance, WYSIWYGInstance } from './types';
import { VDITOR_CONSTANTS } from './types';
import { editorUtils } from './utils';
import { isFirefox, isCtrl } from './utils';

export class WYSIWYGEditor implements WYSIWYGInstance {
  public range: Range;
  public element: HTMLPreElement;
  public popover: HTMLDivElement;
  public selectPopover: HTMLDivElement;
  public afterRenderTimeoutId: number = 0;
  public hlToolbarTimeoutId: number = 0;
  public preventInput: boolean = false;
  public composingLock: boolean = false;
  public commentIds: string[] = [];
  private scrollListener: (() => void) | null = null;

  constructor(vditor: VditorInstance) {
    this.element = this.createElement(vditor);
    this.popover = this.createPopover();
    this.selectPopover = this.createSelectPopover(vditor);
    this.range = document.createRange();
    
    this.bindEvents(vditor);
  }

  private createElement(vditor: VditorInstance): HTMLPreElement {
    const divElement = document.createElement('div');
    divElement.className = 'vditor-wysiwyg';

    divElement.innerHTML = `
      <pre class="vditor-reset" placeholder="${vditor.options.placeholder}"
           contenteditable="true" spellcheck="false"></pre>
      <div class="vditor-panel vditor-panel--none"></div>
      <div class="vditor-panel vditor-panel--none">
        <button type="button" aria-label="评论" class="vditor-icon vditor-tooltipped vditor-tooltipped__n">
          <svg><use xlink:href="#vditor-icon-comment"></use></svg>
        </button>
      </div>
    `;

    return divElement.firstElementChild as HTMLPreElement;
  }

  private createPopover(): HTMLDivElement {
    const popover = document.createElement('div');
    popover.className = 'vditor-panel vditor-panel--none';
    return popover;
  }

  private createSelectPopover(vditor: VditorInstance): HTMLDivElement {
    const selectPopover = document.createElement('div');
    selectPopover.className = 'vditor-panel vditor-panel--none';
    
    if (vditor.options.comment.enable) {
      selectPopover.innerHTML = `
        <button type="button" aria-label="评论" class="vditor-icon vditor-tooltipped vditor-tooltipped__n">
          <svg><use xlink:href="#vditor-icon-comment"></use></svg>
        </button>
      `;
    }
    
    return selectPopover;
  }

  private bindEvents(vditor: VditorInstance): void {
    this.bindScrollEvents(vditor);
    this.bindInputEvents(vditor);
    this.bindClickEvents(vditor);
    this.bindKeyboardEvents(vditor);
    this.bindPasteEvents(vditor);
    this.bindCompositionEvents(vditor);
  }

  private bindScrollEvents(vditor: VditorInstance): void {
    this.unbindListener();
    
    this.scrollListener = () => {
      this.hidePanel(vditor, ['hint']);
      
      if (this.popover.style.display !== 'block' && this.selectPopover.style.display !== 'block') {
        return;
      }
      
      const top = parseInt(this.popover.getAttribute('data-top') || '0', 10);
      if (vditor.options.height !== 'auto') {
        if (vditor.options.toolbarConfig.pin && vditor.toolbar.element.getBoundingClientRect().top === 0) {
          const popoverTop = Math.max(window.scrollY - vditor.element.offsetTop - 8,
            Math.min(top - vditor.wysiwyg.element.scrollTop, this.element.clientHeight - 21)) + 'px';
          if (this.popover.style.display === 'block') {
            this.popover.style.top = popoverTop;
          }
          if (this.selectPopover.style.display === 'block') {
            this.selectPopover.style.top = popoverTop;
          }
        }
        return;
      } else if (!vditor.options.toolbarConfig.pin) {
        return;
      }
      
      const popoverTop1 = Math.max(top, (window.scrollY - vditor.element.offsetTop - 8)) + 'px';
      if (this.popover.style.display === 'block') {
        this.popover.style.top = popoverTop1;
      }
      if (this.selectPopover.style.display === 'block') {
        this.selectPopover.style.top = popoverTop1;
      }
    };
    
    window.addEventListener('scroll', this.scrollListener);

    this.element.addEventListener('scroll', () => {
      this.hidePanel(vditor, ['hint']);
      
      // 注释滚动功能暂时禁用
      // if (vditor.options.comment && vditor.options.comment.enable && vditor.options.comment.scroll) {
      //   vditor.options.comment.scroll(vditor.wysiwyg.element.scrollTop);
      // }
      
      if (this.popover.style.display !== 'block') {
        return;
      }
      
      const top = parseInt(this.popover.getAttribute('data-top') || '0', 10) - vditor.wysiwyg.element.scrollTop;
      let max = -8;
      if (vditor.options.toolbarConfig.pin && vditor.toolbar.element.getBoundingClientRect().top === 0) {
        max = window.scrollY - vditor.element.offsetTop + max;
      }
      const topPx = Math.max(max, Math.min(top, this.element.clientHeight - 21)) + 'px';
      this.popover.style.top = topPx;
      this.selectPopover.style.top = topPx;
    });
  }

  private bindInputEvents(vditor: VditorInstance): void {
    this.element.addEventListener('input', (event: Event) => {
      const inputEvent = event as InputEvent;
      if (inputEvent.inputType === 'deleteByDrag' || inputEvent.inputType === 'insertFromDrop') {
        return;
      }
      
      if (this.preventInput) {
        this.preventInput = false;
        this.afterRenderEvent(vditor);
        return;
      }
      
      if (this.composingLock || inputEvent.data === "'" || inputEvent.data === '"' || inputEvent.data === '《') {
        this.afterRenderEvent(vditor);
        return;
      }
      
      const range = editorUtils.getEditorRange(vditor);
      let blockElement = editorUtils.hasClosestBlock(range.startContainer);
      
      if (!blockElement) {
        this.modifyPre(vditor, range);
        blockElement = editorUtils.hasClosestBlock(range.startContainer);
      }
      
      if (!blockElement) {
        return;
      }

      // 处理输入
      this.processInput(vditor, range, inputEvent, blockElement);
    });
  }

  private bindClickEvents(vditor: VditorInstance): void {
    this.element.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT') {
        const checkElement = target as HTMLInputElement;
        if (checkElement.checked) {
          checkElement.setAttribute('checked', 'checked');
        } else {
          checkElement.removeAttribute('checked');
        }
        this.preventInput = true;
        const selection = window.getSelection();
        if (selection?.rangeCount && selection.rangeCount > 0) {
          editorUtils.setSelectionFocus(selection.getRangeAt(0));
        }
        this.afterRenderEvent(vditor);
        return;
      }

      if (target.tagName === 'IMG' &&
          !target.parentElement?.classList.contains('vditor-wysiwyg__preview')) {
        if (target.getAttribute('data-type') === 'link-ref') {
          this.genLinkRefPopover(vditor, target);
        } else {
          this.genImagePopover(event as MouseEvent, vditor);
        }
        return;
      }

      // 打开链接
      const a = editorUtils.hasClosestByMatchTag(target, 'A');
      if (a) {
        if (vditor.options.link.click) {
          vditor.options.link.click(a as HTMLAnchorElement);
        } else if (vditor.options.link.isOpen) {
          window.open(a.getAttribute('href') || '');
        }
        event.preventDefault();
        return;
      }

      const range = editorUtils.getEditorRange(vditor);
      if (target.isEqualNode(this.element) && this.element.lastElementChild && range.collapsed) {
        const lastRect = this.element.lastElementChild.getBoundingClientRect();
        const mouseEvent = event as MouseEvent;
        if (mouseEvent.y > lastRect.top + lastRect.height) {
          if (this.element.lastElementChild.tagName === 'P' &&
              this.element.lastElementChild.textContent?.trim().replace(VDITOR_CONSTANTS.ZWSP, '') === '') {
            range.selectNodeContents(this.element.lastElementChild);
            range.collapse(false);
          } else {
            this.element.insertAdjacentHTML('beforeend',
              `<p data-block="0">${VDITOR_CONSTANTS.ZWSP}<wbr></p>`);
            editorUtils.setRangeByWbr(this.element, range);
          }
        }
      }

      this.highlightToolbarWYSIWYG(vditor);
      this.clickToc(event as MouseEvent, vditor);
    });
  }

  private bindKeyboardEvents(vditor: VditorInstance): void {
    this.element.addEventListener('keyup', (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.isComposing || isCtrl(keyEvent)) {
        return;
      }
      
      if (keyEvent.key === 'Enter') {
        this.scrollCenter(vditor);
      }
      
      if ((keyEvent.key === 'Backspace' || keyEvent.key === 'Delete') &&
          vditor.wysiwyg.element.innerHTML !== '' && vditor.wysiwyg.element.childNodes.length === 1 &&
          vditor.wysiwyg.element.firstElementChild && vditor.wysiwyg.element.firstElementChild.tagName === 'P'
          && vditor.wysiwyg.element.firstElementChild.childElementCount === 0
          && (vditor.wysiwyg.element.textContent === '' || vditor.wysiwyg.element.textContent === '\n')) {
        vditor.wysiwyg.element.innerHTML = '';
      }
      
      const range = editorUtils.getEditorRange(vditor);
      if (keyEvent.key === 'Backspace') {
        if (isFirefox() && range.startContainer.textContent === '\n' && range.startOffset === 1) {
          range.startContainer.textContent = '';
        }
      }

      this.modifyPre(vditor, range);
      this.highlightToolbarWYSIWYG(vditor);

      if (keyEvent.key !== 'ArrowDown' && keyEvent.key !== 'ArrowRight' && keyEvent.key !== 'Backspace'
          && keyEvent.key !== 'ArrowLeft' && keyEvent.key !== 'ArrowUp') {
        return;
      }

      if (keyEvent.key === 'ArrowLeft' || keyEvent.key === 'ArrowRight') {
        if (vditor.hint) {
          vditor.hint.render(vditor);
        }
      }
    });
  }

  private bindPasteEvents(vditor: VditorInstance): void {
    this.element.addEventListener('paste', (event: Event) => {
      this.paste(vditor, event as ClipboardEvent);
    });
  }

  private bindCompositionEvents(vditor: VditorInstance): void {
    this.element.addEventListener('compositionstart', () => {
      this.composingLock = true;
    });

    this.element.addEventListener('compositionend', (event: Event) => {
      const selection = window.getSelection();
      const headingElement = selection?.rangeCount ? editorUtils.hasClosestByHeadings(selection.getRangeAt(0).startContainer) : null;
      if (headingElement && headingElement.textContent === '') {
        editorUtils.renderToc(vditor);
        return;
      }
      if (!isFirefox()) {
        const range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
        if (range) {
          this.input(vditor, range, event as InputEvent);
        }
      }
      this.composingLock = false;
    });
  }

  private processInput(vditor: VditorInstance, range: Range, _event: InputEvent, blockElement: HTMLElement): void {
    // 保存光标
    this.element.querySelectorAll('wbr').forEach((wbr) => {
      wbr.remove();
    });
    range.insertNode(document.createElement('wbr'));

    // 清除样式
    blockElement.querySelectorAll('[style]').forEach((item) => {
      item.removeAttribute('style');
    });

    // 移除空评论
    blockElement.querySelectorAll('.vditor-comment').forEach((item) => {
      if (item.textContent?.trim() === '') {
        item.classList.remove('vditor-comment', 'vditor-comment--focus');
        item.removeAttribute('data-cmtids');
      }
    });

    let html = '';
    if (blockElement.getAttribute('data-type') === 'link-ref-defs-block') {
      blockElement = vditor.wysiwyg.element;
    }

    const isWYSIWYGElement = blockElement.isEqualNode(vditor.wysiwyg.element);
    
    if (!isWYSIWYGElement) {
      html = blockElement.outerHTML;
    } else {
      html = blockElement.innerHTML;
    }

    // 合并多个相同元素
    html = html.replace(/<\/(strong|b)><strong data-marker="\W{2}">/g, '')
      .replace(/<\/(em|i)><em data-marker="\W{1}">/g, '')
      .replace(/<\/(s|strike)><s data-marker="~{1,2}">/g, '');

    // 通过Lute转换
    if (vditor.lute) {
      html = vditor.lute.SpinVditorDOM(html);
    }

    if (isWYSIWYGElement) {
      blockElement.innerHTML = html;
    } else {
      blockElement.outerHTML = html;
    }

    // 设置光标
    editorUtils.setRangeByWbr(vditor.wysiwyg.element, range);

    // 处理代码渲染
    vditor.wysiwyg.element.querySelectorAll('.vditor-wysiwyg__preview[data-render="2"]')
      .forEach((item: Element) => {
        editorUtils.processCodeRender(item as HTMLElement, vditor);
      });

    editorUtils.renderToc(vditor);
    this.afterRenderEvent(vditor, {
      enableAddUndoStack: true,
      enableHint: true,
      enableInput: true,
    });
  }

  private input(vditor: VditorInstance, range: Range, event?: InputEvent): void {
    // 实现输入处理逻辑
    this.processInput(vditor, range, event as InputEvent, editorUtils.hasClosestBlock(range.startContainer) || vditor.wysiwyg.element);
  }

  private modifyPre(_vditor: VditorInstance, range: Range): void {
    // 修改pre元素
    if (!editorUtils.hasClosestBlock(range.startContainer)) {
      const p = document.createElement('p');
      p.setAttribute('data-block', '0');
      p.innerHTML = `${VDITOR_CONSTANTS.ZWSP}<wbr>`;
      this.element.appendChild(p);
      range.selectNodeContents(p);
      range.collapse(false);
      editorUtils.setSelectionFocus(range);
    }
  }

  private paste(vditor: VditorInstance, event: ClipboardEvent): void {
    // 实现粘贴处理
    const range = editorUtils.getEditorRange(vditor);
    const node = document.createElement('template');
    node.innerHTML = event.clipboardData?.getData('text/html') || '';
    range.insertNode(node.content.cloneNode(true));
    const blockElement = editorUtils.hasClosestByAttribute(range.startContainer, 'data-block', '0');
    if (blockElement) {
      blockElement.outerHTML = vditor.lute?.SpinVditorDOM(blockElement.outerHTML) || blockElement.outerHTML;
    } else {
      vditor.wysiwyg.element.innerHTML = vditor.lute?.SpinVditorDOM(vditor.wysiwyg.element.innerHTML) || vditor.wysiwyg.element.innerHTML;
    }
    editorUtils.setRangeByWbr(vditor.wysiwyg.element, range);
  }

  private hidePanel(vditor: VditorInstance, panels: string[]): void {
    // 隐藏面板
    panels.forEach(panel => {
      if (panel === 'hint' && vditor.hint) {
        // 隐藏提示面板
      }
    });
  }

  private afterRenderEvent(vditor: VditorInstance, options: any = {}): void {
    // 渲染后事件处理
    if (options.enableAddUndoStack && vditor.undo) {
      vditor.undo.addToUndoStack(vditor);
    }
  }

  private highlightToolbarWYSIWYG(_vditor: VditorInstance): void {
    // 高亮工具栏
  }

  private clickToc(_event: MouseEvent, _vditor: VditorInstance): void {
    // 点击目录
  }

  private genLinkRefPopover(_vditor: VditorInstance, _element: HTMLElement): void {
    // 生成链接引用弹窗
  }

  private genImagePopover(_event: MouseEvent, _vditor: VditorInstance): void {
    // 生成图片弹窗
  }

  private scrollCenter(vditor: VditorInstance): void {
    // 滚动到中心
    editorUtils.scrollCenter(vditor);
  }

  public unbindListener(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }

  public getComments(vditor: VditorInstance, getData = false): any[] {
    if (vditor.currentMode === 'wysiwyg' && vditor.options.comment.enable) {
      this.commentIds = [];
      this.element.querySelectorAll('.vditor-comment').forEach((item) => {
        this.commentIds = this.commentIds.concat(item.getAttribute('data-cmtids')?.split(' ') || []);
      });
      this.commentIds = Array.from(new Set(this.commentIds));

      const comments: any[] = [];
      if (getData) {
        this.commentIds.forEach((id) => {
          comments.push({
            id,
            top: (this.element.querySelector(`.vditor-comment[data-cmtids="${id}"]`) as HTMLElement)?.offsetTop || 0,
          });
        });
        return comments;
      }
    }
    return [];
  }

  public triggerRemoveComment(_vditor: VditorInstance): void {
    // 触发移除评论
  }

  public showComment(): void {
    const position = editorUtils.getCursorPosition(this.element);
    this.selectPopover.setAttribute('style', `left:${position.left}px;display:block;top:${Math.max(-8, position.top - 21)}px`);
  }

  public hideComment(): void {
    this.selectPopover.setAttribute('style', 'display:none');
  }
}
