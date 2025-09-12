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

// 获取翻译后的配置
export const getSiteConfig = (t: (key: string) => string): SiteConfig => ({
  siteName: t('config.site.name'),
  siteDescription: t('config.site.description'),
  siteTagline: t('config.site.tagline'),
  
  logo: {
    light: "/avatar/avatar_light.png", // 确保这两个路径存在
    dark: "/avatar/avatar_dark.png", // 确保这两个路径存在
    fallback: "/avatar/avatar.png"
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
});

// 默认配置（向后兼容）
export const defaultSiteConfig: SiteConfig = {
  siteName: 'MareateBank',
  siteDescription: 'Intelligent Question Bank Management Platform',
  siteTagline: 'Intelligent Question Bank Management Platform',
  
  logo: {
    light: "/avatar/avatar_light.png",
    dark: "/avatar/avatar_dark.png",
    fallback: "/avatar/avatar.png"
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

// 获取Logo路径
export const getLogoPath = (isDark: boolean, fallback?: boolean): string => {
  const config = defaultSiteConfig;
  
  if (fallback) {
    return config.logo.fallback;
  }
  
  return isDark ? config.logo.dark : config.logo.light;
};

// 获取网站名称（向后兼容）
export const getSiteName = (): string => {
  return defaultSiteConfig.siteName;
};

// 获取网站描述（向后兼容）
export const getSiteDescription = (): string => {
  return defaultSiteConfig.siteDescription;
};

// 获取网站标语（向后兼容）
export const getSiteTagline = (): string => {
  return defaultSiteConfig.siteTagline;
};
