// Vditor WYSIWYG 编辑器类型定义
export interface VditorOptions {
  mode: 'wysiwyg' | 'sv' | 'ir';
  height: string | number;
  width: string | number;
  placeholder: string;
  theme: 'classic' | 'dark';
  cache: {
    enable: boolean;
    id: string;
  };
  preview: {
    mode: 'both' | 'editor';
    theme: {
      current: string;
      list: Record<string, string>;
      path: string;
    };
    markdown: {
      autoSpace: boolean;
      gfmAutoLink: boolean;
      codeBlockPreview: boolean;
      fixTermTypo: boolean;
      footnotes: boolean;
      linkBase: string;
      linkPrefix: string;
      listStyle: boolean;
      mark: boolean;
      mathBlockPreview: boolean;
      paragraphBeginningSpace: boolean;
      sanitize: boolean;
      toc: boolean;
    };
    math: {
      engine: 'KaTeX' | 'MathJax';
      inlineDigit: boolean;
      macros: Record<string, string>;
    };
    hljs: {
      enable: boolean;
      lineNumber: boolean;
      defaultLang: string;
      style: string;
    };
  };
  toolbar: Array<string | ToolbarItem>;
  toolbarConfig: {
    hide: boolean;
    pin: boolean;
  };
  undoDelay: number;
  input?: (value: string) => void;
  after?: () => void;
  cdn: string;
  lang: string;
  i18n?: Record<string, string>;
  icon: string;
  hint: {
    delay: number;
    emoji: Record<string, string>;
    emojiPath: string;
    extend: any[];
    parse: boolean;
  };
  comment: {
    enable: boolean;
  };
  counter: {
    enable: boolean;
    type: 'markdown' | 'text';
  };
  resize: {
    enable: boolean;
    position: 'top' | 'bottom';
  };
  link: {
    isOpen: boolean;
    click?: (element: HTMLAnchorElement) => void;
  };
  image: {
    isPreview: boolean;
  };
  upload: {
    url: string;
    fieldName: string;
    max: number;
    multiple: boolean;
    withCredentials: boolean;
    extraData: Record<string, any>;
    filename: (name: string) => string;
    linkToImgUrl: string;
    handler?: (files: File[]) => Promise<string[]>;
  };
  fullscreen: {
    index: number;
  };
  outline: {
    enable: boolean;
    position: 'left' | 'right';
  };
  typewriterMode: boolean;
  debugger: boolean;
  customRenders: any[];
  classes: {
    preview: string;
  };
  rtl: boolean;
  value: string;
}

export interface ToolbarItem {
  name: string;
  icon?: string;
  tip?: string;
  tipPosition?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  hotkey?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  level?: number;
  toolbar?: Array<string | ToolbarItem>;
}

export interface VditorInstance {
  currentMode: 'wysiwyg' | 'sv' | 'ir';
  element: HTMLElement;
  wysiwyg: WYSIWYGInstance;
  toolbar: ToolbarInstance;
  undo: UndoInstance;
  lute: LuteInstance;
  options: VditorOptions;
  hint: HintInstance;
  tip: TipInstance;
  outline: OutlineInstance;
  preview?: PreviewInstance;
  upload?: UploadInstance;
  resize?: ResizeInstance;
  devtools?: DevToolsInstance;
  counter?: CounterInstance;
  originalInnerHTML: string;
  // 添加缺失的属性
  sv?: any;
  ir?: any;
}

export interface WYSIWYGInstance {
  element: HTMLPreElement;
  popover: HTMLDivElement;
  selectPopover: HTMLDivElement;
  afterRenderTimeoutId: number;
  hlToolbarTimeoutId: number;
  preventInput: boolean;
  composingLock: boolean;
  commentIds: string[];
  range: Range;
  unbindListener: () => void;
  getComments: (vditor: VditorInstance, getData?: boolean) => any[];
  triggerRemoveComment: (vditor: VditorInstance) => void;
  showComment: () => void;
  hideComment: () => void;
}

export interface ToolbarInstance {
  element: HTMLElement;
  elements: Record<string, HTMLElement>;
  updateConfig: (vditor: VditorInstance, options: any) => void;
}

export interface UndoInstance {
  undoStack: any[][];
  redoStack: any[][];
  hasUndo: boolean;
  lastText: string;
  addToUndoStack: (vditor: VditorInstance) => void;
  undo: (vditor: VditorInstance) => void;
  redo: (vditor: VditorInstance) => void;
  clearStack: (vditor: VditorInstance) => void;
  resetIcon: (vditor: VditorInstance) => void;
}

export interface LuteInstance {
  Md2VditorDOM: (md: string) => string;
  VditorDOM2Md: (html: string) => string;
  VditorDOM2HTML: (html: string) => string;
  SpinVditorDOM: (html: string) => string;
  HTML2Md: (html: string) => string;
  RenderJSON: (md: string) => any;
  NewNodeID: () => string;
}

export interface HintInstance {
  recentLanguage: string;
  render: (vditor: VditorInstance) => void;
}

export interface TipInstance {
  element: HTMLElement;
  show: (text: string, time?: number) => void;
}

export interface OutlineInstance {
  element: HTMLElement;
  render: (vditor: VditorInstance) => void;
}

export interface PreviewInstance {
  element: HTMLElement;
  render: (vditor: VditorInstance, value?: string) => void;
}

export interface UploadInstance {
  isUploading: boolean;
}

export interface ResizeInstance {
  element: HTMLElement;
}

export interface DevToolsInstance {
  element: HTMLElement;
  renderEchart: (vditor: VditorInstance) => void;
}

export interface CounterInstance {
  element: HTMLElement;
  render: (vditor: VditorInstance, text: string) => void;
}

// 工具函数类型
export interface EditorUtils {
  getEditorRange: (vditor: VditorInstance) => Range;
  setRangeByWbr: (element: HTMLElement, range: Range) => void;
  setSelectionFocus: (range: Range) => void;
  getCursorPosition: (element: HTMLElement) => { left: number; top: number };
  getSelectText: (element: HTMLElement) => string;
  hasClosestBlock: (node: Node) => HTMLElement | null;
  hasClosestByMatchTag: (node: Node, tagName: string) => HTMLElement | null;
  hasClosestByAttribute: (node: Node, attribute: string, value: string) => HTMLElement | null;
  hasClosestByClassName: (node: Node, className: string) => HTMLElement | null;
  hasClosestByHeadings: (node: Node) => HTMLElement | null;
  getTopList: (node: Node) => HTMLElement | null;
  processCodeRender: (element: HTMLElement, vditor: VditorInstance) => void;
  renderToc: (vditor: VditorInstance) => void;
  afterRenderEvent: (vditor: VditorInstance, options?: any) => void;
  insertHTML: (html: string, vditor: VditorInstance) => void;
  execAfterRender: (vditor: VditorInstance, options?: any) => void;
  scrollCenter: (vditor: VditorInstance) => void;
}

// 常量定义
export const VDITOR_CONSTANTS = {
  ZWSP: '\u200b',
  DROP_EDITOR: 'application/editor',
  MOBILE_WIDTH: 520,
  CLASS_MENU_DISABLED: 'vditor-menu--disabled',
  EDIT_TOOLBARS: ['emoji', 'headings', 'bold', 'italic', 'strike', 'link', 'list',
    'ordered-list', 'outdent', 'indent', 'check', 'line', 'quote', 'code', 'inline-code', 'insert-after',
    'insert-before', 'upload', 'record', 'table'],
  CDN: 'https://unpkg.com/vditor@3.11.2',
  MARKDOWN_OPTIONS: {
    autoSpace: false,
    gfmAutoLink: true,
    codeBlockPreview: true,
    fixTermTypo: false,
    footnotes: true,
    linkBase: '',
    linkPrefix: '',
    listStyle: false,
    mark: false,
    mathBlockPreview: true,
    paragraphBeginningSpace: false,
    sanitize: true,
    toc: false,
  },
  HLJS_OPTIONS: {
    enable: true,
    lineNumber: false,
    defaultLang: '',
    style: 'github',
  },
  MATH_OPTIONS: {
    engine: 'KaTeX',
    inlineDigit: false,
    macros: {},
  },
  THEME_OPTIONS: {
    current: 'light',
    list: {
      'ant-design': 'Ant Design',
      'dark': 'Dark',
      'light': 'Light',
      'wechat': 'WeChat',
    },
    path: 'https://unpkg.com/vditor@3.11.2/dist/css/content-theme',
  },
} as const;
