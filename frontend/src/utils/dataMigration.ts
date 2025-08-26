/**
 * 数据迁移工具
 * 用于清理localStorage中的旧数据并迁移到后端
 */

// 需要清理的localStorage键
const OLD_STORAGE_KEYS = [
  'batchUploadCurrentDocuments',
  'batchUploadCurrentQuestions', 
  'batchUploadGlobalStatus',
  'batchUploadHistory',
  'questionDrafts', // 旧的草稿存储
  'draftQuestions', // 旧的草稿题目
  'currentDraft'    // 旧的当前草稿
];

// 需要保留的localStorage键（认证等）
const PRESERVE_STORAGE_KEYS = [
  'auth-storage',
  'backgroundTasks',
  'user-preferences',
  'theme-settings'
];

/**
 * 清理旧的localStorage数据
 */
export const cleanupOldStorage = () => {
  console.log('🧹 开始清理旧的localStorage数据...');
  
  let cleanedCount = 0;
  
  OLD_STORAGE_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleanedCount++;
      console.log(`🗑️ 清理: ${key}`);
    }
  });
  
  console.log(`✅ 清理完成，共清理 ${cleanedCount} 个键`);
  return cleanedCount;
};

/**
 * 检查并清理过期的localStorage数据
 */
export const checkAndCleanupStorage = () => {
  const allKeys = Object.keys(localStorage);
  const unknownKeys = allKeys.filter(key => 
    !PRESERVE_STORAGE_KEYS.includes(key) && 
    !OLD_STORAGE_KEYS.includes(key)
  );
  
  if (unknownKeys.length > 0) {
    console.log('⚠️ 发现未知的localStorage键:', unknownKeys);
    
    // 询问用户是否清理
    if (confirm(`发现 ${unknownKeys.length} 个未知的存储键，是否清理？\n\n${unknownKeys.join('\n')}`)) {
      unknownKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ 清理未知键: ${key}`);
      });
    }
  }
  
  return unknownKeys;
};

/**
 * 获取localStorage使用情况
 */
export const getStorageInfo = () => {
  const allKeys = Object.keys(localStorage);
  const totalSize = allKeys.reduce((size, key) => {
    const value = localStorage.getItem(key);
    return size + (value ? value.length : 0);
  }, 0);
  
  return {
    totalKeys: allKeys.length,
    totalSize: totalSize,
    oldKeys: allKeys.filter(key => OLD_STORAGE_KEYS.includes(key)),
    preserveKeys: allKeys.filter(key => PRESERVE_STORAGE_KEYS.includes(key)),
    unknownKeys: allKeys.filter(key => 
      !PRESERVE_STORAGE_KEYS.includes(key) && 
      !OLD_STORAGE_KEYS.includes(key)
    )
  };
};

/**
 * 强制清理所有非必要数据
 */
export const forceCleanup = () => {
  console.log('🧹 强制清理所有非必要数据...');
  
  const allKeys = Object.keys(localStorage);
  let cleanedCount = 0;
  
  allKeys.forEach(key => {
    if (!PRESERVE_STORAGE_KEYS.includes(key)) {
      localStorage.removeItem(key);
      cleanedCount++;
      console.log(`🗑️ 强制清理: ${key}`);
    }
  });
  
  console.log(`✅ 强制清理完成，共清理 ${cleanedCount} 个键`);
  return cleanedCount;
};

/**
 * 数据迁移状态检查
 */
export const checkMigrationStatus = () => {
  const info = getStorageInfo();
  
  return {
    isClean: info.oldKeys.length === 0 && info.unknownKeys.length === 0,
    oldDataExists: info.oldKeys.length > 0,
    unknownDataExists: info.unknownKeys.length > 0,
    totalSize: info.totalSize,
    details: info
  };
};

export default {
  cleanupOldStorage,
  checkAndCleanupStorage,
  getStorageInfo,
  forceCleanup,
  checkMigrationStatus
};
