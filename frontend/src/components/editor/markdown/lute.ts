// Lute引擎集成
import type { VditorOptions, LuteInstance } from './types';

// 声明全局Lute类型
declare global {
  interface Window {
    Lute: any;
  }
}

export class LuteManager {
  private static instance: LuteManager;
  private lute: LuteInstance | null = null;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): LuteManager {
    if (!LuteManager.instance) {
      LuteManager.instance = new LuteManager();
    }
    return LuteManager.instance;
  }

  public async loadLute(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      // 检查是否已经加载
      if (window.Lute) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // 动态加载Lute脚本
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/vditor@3.11.2/dist/js/lute/lute.min.js';
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Lute engine'));
      };
      document.head.appendChild(script);
    });
  }

  public createLute(options: Partial<VditorOptions>): LuteInstance {
    if (!window.Lute) {
      throw new Error('Lute engine not loaded');
    }

    const lute = window.Lute.New();
    
    // 配置Lute选项
    lute.PutEmojis(options.hint?.emoji || {});
    lute.SetEmojiSite(options.hint?.emojiPath || '');
    lute.SetHeadingAnchor(false);
    lute.SetInlineMathAllowDigitAfterOpenMarker(options.preview?.math?.inlineDigit || false);
    lute.SetAutoSpace(options.preview?.markdown?.autoSpace || false);
    lute.SetToC(options.preview?.markdown?.toc || false);
    lute.SetFootnotes(options.preview?.markdown?.footnotes || true);
    lute.SetFixTermTypo(options.preview?.markdown?.fixTermTypo || false);
    lute.SetVditorCodeBlockPreview(options.preview?.markdown?.codeBlockPreview || true);
    lute.SetVditorMathBlockPreview(options.preview?.markdown?.mathBlockPreview || true);
    lute.SetSanitize(options.preview?.markdown?.sanitize || true);
    lute.SetChineseParagraphBeginningSpace(options.preview?.markdown?.paragraphBeginningSpace || false);
    lute.SetRenderListStyle(options.preview?.markdown?.listStyle || false);
    lute.SetLinkBase(options.preview?.markdown?.linkBase || '');
    lute.SetLinkPrefix(options.preview?.markdown?.linkPrefix || '');
    lute.SetMark(options.preview?.markdown?.mark || false);
    lute.SetGFMAutoLink(options.preview?.markdown?.gfmAutoLink || true);

    this.lute = lute;
    return lute;
  }

  public getLute(): LuteInstance | null {
    return this.lute;
  }

  public isLuteLoaded(): boolean {
    return this.isLoaded && !!window.Lute;
  }
}

// 导出单例实例
export const luteManager = LuteManager.getInstance();

// 工具函数
export const setLute = (options: Partial<VditorOptions>): LuteInstance => {
  return luteManager.createLute(options);
};

// 默认Lute配置
export const getDefaultLuteOptions = (): Partial<VditorOptions> => ({
  preview: {
    mode: 'both',
    theme: {
      current: 'light',
      list: {
        'ant-design': 'Ant Design',
        'dark': 'Dark',
        'light': 'Light',
        'wechat': 'WeChat',
      },
      path: 'https://unpkg.com/vditor@3.11.2/dist/css/content-theme',
    },
    markdown: {
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
    math: {
      engine: 'KaTeX',
      inlineDigit: false,
      macros: {},
    },
    hljs: {
      enable: true,
      lineNumber: false,
      defaultLang: '',
      style: 'github',
    },
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
    emojiPath: 'https://unpkg.com/vditor@3.11.2/dist/images/emoji',
    extend: [],
    parse: true,
  },
});
