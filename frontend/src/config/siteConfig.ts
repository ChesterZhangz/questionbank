// 网站配置文件 - 为服务器端配置做准备
export interface SiteConfig {
  // 网站基本信息
  siteName: string;
  siteDescription: string;
  siteTagline: string;
  
  // Logo配置
  logo: {
    light: string;      // 浅色模式Logo路径
    dark: string;       // 深色模式Logo路径
    fallback: string;   // 备用Logo路径（彩色版本）
  };
  
  // 主题配置
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  
  // 功能开关
  features: {
    enableEnterprise: boolean;
    enableUserManagement: boolean;
    enableAnalytics: boolean;
  };
}

// 默认配置
export const defaultSiteConfig: SiteConfig = {
  siteName: 'MareateBank',
  siteDescription: '智能题库管理平台',
  siteTagline: '智能题库管理平台',
  
  logo: {
    light: '/avatar/avatar_light.png',
    dark: '/avatar/avatar_dark.png',
    fallback: '/avatar/avatar.png'
  },
  
  theme: {
    primaryColor: '#4f46e5',
    accentColor: '#06b6d4'
  },
  
  features: {
    enableEnterprise: true,
    enableUserManagement: true,
    enableAnalytics: true
  }
};

// 获取当前配置（未来可以从API获取）
export const getSiteConfig = (): SiteConfig => {
  // 这里可以添加从localStorage或API获取配置的逻辑
  // 目前返回默认配置
  return defaultSiteConfig;
};

// 获取Logo路径
export const getLogoPath = (isDark: boolean, fallback?: boolean): string => {
  const config = getSiteConfig();
  
  if (fallback) {
    return config.logo.fallback;
  }
  
  return isDark ? config.logo.dark : config.logo.light;
};

// 获取网站名称
export const getSiteName = (): string => {
  const config = getSiteConfig();
  return config.siteName;
};

// 获取网站描述
export const getSiteDescription = (): string => {
  const config = getSiteConfig();
  return config.siteDescription;
};

// 获取网站标语
export const getSiteTagline = (): string => {
  const config = getSiteConfig();
  return config.siteTagline;
};
