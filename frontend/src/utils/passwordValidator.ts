/**
 * 密码验证工具
 * 实现严格的密码安全规则
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

// 翻译函数类型
export type TranslationFunction = (key: string, params?: Record<string, any>) => string;

/**
 * 密码强度评估和验证
 */
export class PasswordValidator {
  
  /**
   * 验证密码是否符合所有安全规则
   */
  static validate(password: string, username?: string, email?: string, t?: TranslationFunction): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // 1. 长度检查 (8-20位)
    if (password.length < 8) {
      const message = t ? t('utils.passwordValidator.errors.tooShort') : '密码长度不能少于8位';
      errors.push(message);
    } else if (password.length > 20) {
      const message = t ? t('utils.passwordValidator.errors.tooLong') : '密码长度不能超过20位';
      errors.push(message);
    } else {
      score += 20; // 基础分数
    }

    // 2. 不允许与用户名相关
    if (username && this.isRelatedToUsername(password, username)) {
      const message = t ? t('utils.passwordValidator.errors.containsUsername') : '密码不能包含用户名相关内容';
      errors.push(message);
    } else if (username) {
      score += 15;
    }

    // 3. 不允许与邮箱相关
    if (email && this.isRelatedToEmail(password, email)) {
      const message = t ? t('utils.passwordValidator.errors.containsEmail') : '密码不能包含邮箱相关内容';
      errors.push(message);
    } else if (email) {
      score += 15;
    }

    // 4. 不允许出现生日日期模式
    if (this.containsBirthDatePattern(password)) {
      const message = t ? t('utils.passwordValidator.errors.containsBirthDate') : '密码不能包含生日日期格式（如：19990101、1999/01/01等）';
      errors.push(message);
    } else {
      score += 15;
    }

    // 5. 不允许连续三位字符/数字重复
    if (this.hasConsecutiveRepeats(password)) {
      const message = t ? t('utils.passwordValidator.errors.consecutiveRepeats') : '密码不能包含连续三位相同的字符或数字';
      errors.push(message);
    } else {
      score += 10;
    }

    // 6. 复杂度检查
    const complexityScore = this.checkComplexity(password);
    score += complexityScore;

    // 7. 常见弱密码检查
    if (this.isCommonWeakPassword(password)) {
      const message = t ? t('utils.passwordValidator.errors.tooSimple') : '密码过于简单，请使用更复杂的密码';
      errors.push(message);
      score = Math.min(score, 30);
    }

    // 计算强度
    const strength = this.calculateStrength(score);

    return {
      isValid: errors.length === 0 && score >= 60,
      errors,
      strength,
      score: Math.min(100, score)
    };
  }

  /**
   * 检查密码是否与用户名相关
   */
  static isRelatedToUsername(password: string, username: string): boolean {
    const lowerPassword = password.toLowerCase();
    const lowerUsername = username.toLowerCase();

    // 检查是否包含用户名
    if (lowerPassword.includes(lowerUsername) || lowerUsername.includes(lowerPassword)) {
      return true;
    }

    // 检查是否包含用户名的反转
    const reversedUsername = lowerUsername.split('').reverse().join('');
    if (lowerPassword.includes(reversedUsername)) {
      return true;
    }

    // 检查是否包含用户名的子串（长度≥3）
    for (let i = 0; i <= lowerUsername.length - 3; i++) {
      const substr = lowerUsername.substring(i, i + 3);
      if (lowerPassword.includes(substr)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查密码是否与邮箱相关
   */
  static isRelatedToEmail(password: string, email: string): boolean {
    const lowerPassword = password.toLowerCase();
    const lowerEmail = email.toLowerCase();

    // 提取邮箱用户名部分
    const emailUsername = lowerEmail.split('@')[0];
    
    // 检查是否包含邮箱用户名
    if (this.isRelatedToUsername(password, emailUsername)) {
      return true;
    }

    // 检查是否包含完整邮箱
    if (lowerPassword.includes(lowerEmail)) {
      return true;
    }

    // 检查是否包含域名部分
    const domain = lowerEmail.split('@')[1];
    if (domain && lowerPassword.includes(domain.split('.')[0])) {
      return true;
    }

    return false;
  }

  /**
   * 检查是否包含生日日期模式
   */
  static containsBirthDatePattern(password: string): boolean {
    // 常见日期格式模式
    const datePatterns = [
      // YYYYMMDD
      /\d{8}/,
      // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
      /\d{4}[-\/\.]\d{2}[-\/\.]\d{2}/,
      // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
      /\d{2}[-\/\.]\d{2}[-\/\.]\d{4}/,
      // MM-DD-YYYY, MM/DD/YYYY, MM.DD.YYYY
      /\d{2}[-\/\.]\d{2}[-\/\.]\d{4}/,
      // DDMMYYYY
      /\d{8}/,
      // MMDDYYYY
      /\d{8}/,
      // 简化年份如：99年、01年等，后跟月日
      /\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/,
      // 1900-2030年份范围
      /(19|20)\d{2}/
    ];

    for (const pattern of datePatterns) {
      if (pattern.test(password)) {
        // 进一步验证是否为合理的日期
        const matches = password.match(pattern);
        if (matches && this.isValidDateString(matches[0])) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 验证字符串是否为有效日期
   */
  private static isValidDateString(dateStr: string): boolean {
    // 检查8位数字是否为有效日期
    if (/^\d{8}$/.test(dateStr)) {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6));
      const day = parseInt(dateStr.substring(6, 8));
      
      if (year >= 1900 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return true;
      }
    }

    // 检查4位年份
    if (/^(19|20)\d{2}$/.test(dateStr)) {
      return true;
    }

    return false;
  }

  /**
   * 检查是否有连续三位字符重复
   */
  static hasConsecutiveRepeats(password: string): boolean {
    for (let i = 0; i <= password.length - 3; i++) {
      const char = password[i];
      if (password[i + 1] === char && password[i + 2] === char) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查密码复杂度
   */
  private static checkComplexity(password: string): number {
    let score = 0;

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 5;
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 10;
    }

    // 包含数字
    if (/\d/.test(password)) {
      score += 5;
    }

    // 包含特殊字符
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 15;
    }

    // 长度奖励
    if (password.length >= 12) {
      score += 10;
    } else if (password.length >= 10) {
      score += 5;
    }

    // 字符种类多样性
    const uniqueChars = new Set(password.split('')).size;
    if (uniqueChars >= password.length * 0.8) {
      score += 10;
    }

    return score;
  }

  /**
   * 检查是否为常见弱密码
   */
  private static isCommonWeakPassword(password: string): boolean {
    const weakPasswords = [
      'password', 'password123', '123456', '12345678', '123456789',
      'qwerty', 'qwerty123', 'abc123', 'admin', 'admin123',
      'root', 'user', 'test', 'guest', 'welcome',
      '111111', '000000', '666666', '888888', '999999',
      'a1b2c3', '123abc', 'abcd1234', 'qwer1234',
      '123qwe', 'asd123', 'zxc123', '1qaz2wsx',
      'password1', 'password!', 'passw0rd'
    ];

    const lowerPassword = password.toLowerCase();
    return weakPasswords.includes(lowerPassword);
  }

  /**
   * 计算密码强度等级
   */
  private static calculateStrength(score: number): 'weak' | 'medium' | 'strong' {
    if (score >= 80) {
      return 'strong';
    } else if (score >= 60) {
      return 'medium';
    } else {
      return 'weak';
    }
  }

  /**
   * 获取密码强度颜色
   */
  static getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'strong':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * 获取密码强度文本
   */
  static getStrengthText(strength: 'weak' | 'medium' | 'strong', t?: TranslationFunction): string {
    if (t) {
      return t(`utils.passwordValidator.strength.${strength}`);
    }
    
    // 默认中文文本
    switch (strength) {
      case 'weak':
        return '弱';
      case 'medium':
        return '中等';
      case 'strong':
        return '强';
      default:
        return '未知';
    }
  }
}
