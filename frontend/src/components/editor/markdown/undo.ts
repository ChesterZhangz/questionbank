// 撤销重做管理器
import * as DiffMatchPatch from 'diff-match-patch';
import type { VditorInstance, UndoInstance } from './types';
import { editorUtils } from './utils';
import { VDITOR_CONSTANTS } from './types';

export class UndoManager implements UndoInstance {
  private stackSize = 50;
  private dmp: any;
  private wysiwyg!: {
    hasUndo: boolean;
    lastText: string;
    redoStack: DiffMatchPatch.patch_obj[][];
    undoStack: DiffMatchPatch.patch_obj[][];
  };
  private ir!: {
    hasUndo: boolean;
    lastText: string;
    redoStack: DiffMatchPatch.patch_obj[][];
    undoStack: DiffMatchPatch.patch_obj[][];
  };
  private sv!: {
    hasUndo: boolean;
    lastText: string;
    redoStack: DiffMatchPatch.patch_obj[][];
    undoStack: DiffMatchPatch.patch_obj[][];
  };

  constructor() {
    this.resetStack();
    // @ts-ignore
    this.dmp = new DiffMatchPatch();
  }

  public clearStack(vditor: VditorInstance): void {
    this.resetStack();
    this.resetIcon(vditor);
  }

  public resetIcon(vditor: VditorInstance): void {
    if (!vditor.toolbar) {
      return;
    }

    const currentStack = this[vditor.currentMode];
    
    if (currentStack.undoStack.length > 1) {
      this.enableToolbar(vditor.toolbar.elements, ['undo']);
    } else {
      this.disableToolbar(vditor.toolbar.elements, ['undo']);
    }

    if (currentStack.redoStack.length !== 0) {
      this.enableToolbar(vditor.toolbar.elements, ['redo']);
    } else {
      this.disableToolbar(vditor.toolbar.elements, ['redo']);
    }
  }

  public undo(vditor: VditorInstance): void {
    if (vditor[vditor.currentMode].element.getAttribute('contenteditable') === 'false') {
      return;
    }
    
    const currentStack = this[vditor.currentMode];
    if (currentStack.undoStack.length < 2) {
      return;
    }
    
    const state = currentStack.undoStack.pop();
    if (!state) {
      return;
    }
    
    currentStack.redoStack.push(state);
    this.renderDiff(state, vditor);
    currentStack.hasUndo = true;
  }

  public redo(vditor: VditorInstance): void {
    if (vditor[vditor.currentMode].element.getAttribute('contenteditable') === 'false') {
      return;
    }
    
    const currentStack = this[vditor.currentMode];
    const state = currentStack.redoStack.pop();
    if (!state) {
      return;
    }
    
    currentStack.undoStack.push(state);
    this.renderDiff(state, vditor, true);
  }

  public recordFirstPosition(vditor: VditorInstance, _event: KeyboardEvent): void {
    if (window.getSelection()?.rangeCount === 0) {
      return;
    }
    
    const currentStack = this[vditor.currentMode];
    if (currentStack.undoStack.length !== 1 || currentStack.undoStack[0].length === 0 ||
        currentStack.redoStack.length > 0) {
      return;
    }
    
    const text = this.addCaret(vditor);
    if (text.replace('<wbr>', '').replace(' vditor-ir__node--expand', '')
        !== currentStack.undoStack[0][0].diffs[0][1].replace('<wbr>', '')) {
      return;
    }
    
    currentStack.undoStack[0][0].diffs[0][1] = text;
    currentStack.lastText = text;
  }

  public addToUndoStack(vditor: VditorInstance): void {
    const currentStack = this[vditor.currentMode];
    const text = this.addCaret(vditor, true);
    const diff = this.dmp.diff_main(text, currentStack.lastText, true);
    const patchList = this.dmp.patch_make(text, currentStack.lastText, diff);
    
    if (patchList.length === 0 && currentStack.undoStack.length > 0) {
      return;
    }
    
    currentStack.lastText = text;
    currentStack.undoStack.push(patchList);
    
    if (currentStack.undoStack.length > this.stackSize) {
      currentStack.undoStack.shift();
    }
    
    if (currentStack.hasUndo) {
      currentStack.redoStack = [];
      currentStack.hasUndo = false;
      this.disableToolbar(vditor.toolbar.elements, ['redo']);
    }

    if (currentStack.undoStack.length > 1) {
      this.enableToolbar(vditor.toolbar.elements, ['undo']);
    }
  }

  private renderDiff(state: DiffMatchPatch.patch_obj[], vditor: VditorInstance, isRedo: boolean = false): void {
    const currentStack = this[vditor.currentMode];
    let text: string;
    
    if (isRedo) {
      const redoPatchList = this.dmp.patch_deepCopy(state).reverse();
      redoPatchList.forEach((patch: any) => {
        patch.diffs.forEach((diff: any) => {
          diff[0] = -diff[0];
        });
      });
      text = this.dmp.patch_apply(redoPatchList, currentStack.lastText)[0];
    } else {
      text = this.dmp.patch_apply(state, currentStack.lastText)[0];
    }

    currentStack.lastText = text;
    vditor[vditor.currentMode].element.innerHTML = text;

    // 处理代码渲染
    if (vditor.currentMode !== 'sv') {
      vditor[vditor.currentMode].element.querySelectorAll(`.vditor-${vditor.currentMode}__preview[data-render='2']`)
        .forEach((blockElement: HTMLElement) => {
          editorUtils.processCodeRender(blockElement, vditor);
        });
    }

    // 设置光标位置
    if (!vditor[vditor.currentMode].element.querySelector('wbr')) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        range.setEndBefore(vditor[vditor.currentMode].element);
        range.collapse(false);
      }
    } else {
      const range = vditor[vditor.currentMode].element.ownerDocument.createRange();
      editorUtils.setRangeByWbr(vditor[vditor.currentMode].element, range);
    }

    // 渲染目录
    editorUtils.renderToc(vditor);

    // 执行渲染后操作
    editorUtils.execAfterRender(vditor, {
      enableAddUndoStack: false,
      enableHint: false,
      enableInput: true,
    });

    // 更新工具栏状态
    this.resetIcon(vditor);
  }

  private resetStack(): void {
    this.ir = {
      hasUndo: false,
      lastText: '',
      redoStack: [],
      undoStack: [],
    };
    this.sv = {
      hasUndo: false,
      lastText: '',
      redoStack: [],
      undoStack: [],
    };
    this.wysiwyg = {
      hasUndo: false,
      lastText: '',
      redoStack: [],
      undoStack: [],
    };
  }

  private addCaret(vditor: VditorInstance, setFocus = false): string {
    let cloneRange: Range | undefined;
    
    if (window.getSelection()?.rangeCount !== 0 && !vditor[vditor.currentMode].element.querySelector('wbr')) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range && vditor[vditor.currentMode].element.contains(range.startContainer)) {
        cloneRange = range.cloneRange();
        const wbrElement = document.createElement('span');
        wbrElement.className = 'vditor-wbr';
        range.insertNode(wbrElement);
      }
    }
    
    // 克隆元素并移除渲染内容
    const cloneElement = vditor[vditor.currentMode].element.cloneNode(true) as HTMLElement;
    cloneElement.querySelectorAll(`.vditor-${vditor.currentMode}__preview[data-render='1']`)
      .forEach((item: Element) => {
        if (!item.firstElementChild) {
          return;
        }
        if (item.firstElementChild.classList.contains('language-echarts') ||
            item.firstElementChild.classList.contains('language-plantuml') ||
            item.firstElementChild.classList.contains('language-mindmap')) {
          item.firstElementChild.removeAttribute('_echarts_instance_');
          item.firstElementChild.removeAttribute('data-processed');
          item.firstElementChild.innerHTML = item.previousElementSibling?.firstElementChild?.innerHTML || '';
          item.setAttribute('data-render', '2');
        } else if (item.firstElementChild.classList.contains('language-math')) {
          item.setAttribute('data-render', '2');
          item.firstElementChild.textContent = item.firstElementChild.getAttribute('data-math') || '';
          item.firstElementChild.removeAttribute('data-math');
        }
      });
    
    const text = cloneElement.innerHTML;
    
    // 清理wbr元素
    vditor[vditor.currentMode].element.querySelectorAll('.vditor-wbr').forEach((item: Element) => {
      item.remove();
    });
    
    if (setFocus && cloneRange) {
      editorUtils.setSelectionFocus(cloneRange);
    }
    
    return text.replace('<span class="vditor-wbr"></span>', '<wbr>');
  }

  private enableToolbar(elements: Record<string, HTMLElement>, names: string[]): void {
    names.forEach(name => {
      const element = elements[name];
      if (element) {
        element.classList.remove(VDITOR_CONSTANTS.CLASS_MENU_DISABLED);
      }
    });
  }

  private disableToolbar(elements: Record<string, HTMLElement>, names: string[]): void {
    names.forEach(name => {
      const element = elements[name];
      if (element) {
        element.classList.add(VDITOR_CONSTANTS.CLASS_MENU_DISABLED);
      }
    });
  }

  // 实现接口属性
  get undoStack(): DiffMatchPatch.patch_obj[][] {
    return this.wysiwyg.undoStack;
  }

  get redoStack(): DiffMatchPatch.patch_obj[][] {
    return this.wysiwyg.redoStack;
  }

  get hasUndo(): boolean {
    return this.wysiwyg.hasUndo;
  }

  get lastText(): string {
    return this.wysiwyg.lastText;
  }
}
