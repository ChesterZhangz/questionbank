/**
 * 认证相关工具函数
 */

/**
 * 完全清理所有认证相关数据
 * 包括localStorage和Zustand持久化数据
 */
export const clearAllAuthData = (): void => {
  // 清理localStorage中的认证数据
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage'); // 清理Zustand持久化数据
  
  // 清理sessionStorage（如果有的话）
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
};

/**
 * 验证JWT令牌是否有效
 * @param token JWT令牌
 * @returns 是否有效
 */
export const validateToken = (token: string): boolean => {
  try {
    // 解析JWT令牌（不验证签名，只检查过期时间）
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 检查令牌是否过期
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
};

/**
 * 获取令牌过期时间
 * @param token JWT令牌
 * @returns 过期时间（Date对象）或null
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('获取令牌过期时间失败:', error);
    return null;
  }
};

/**
 * 检查令牌是否即将过期（默认30分钟内）
 * @param token JWT令牌
 * @param minutes 提前多少分钟警告
 * @returns 是否即将过期
 */
export const isTokenExpiringSoon = (token: string, minutes: number = 30): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  
  const warningTime = new Date(Date.now() + minutes * 60 * 1000);
  return expiration <= warningTime;
}; 