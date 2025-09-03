import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { enterpriseService } from '../services/enterpriseService';

export const useUserAvatar = () => {
  const { user } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user?.enterpriseId) {
        // 如果用户没有企业，使用默认头像
        setAvatarUrl(undefined);
        return;
      }

      try {
        setLoading(true);
        const response = await enterpriseService.getMyEnterpriseInfo();
        if (response.data.success && response.data.currentUser?.avatar) {
          setAvatarUrl(response.data.currentUser.avatar);
        } else {
          setAvatarUrl(undefined);
        }
      } catch (error) {
        // 如果获取失败，使用默认头像
        setAvatarUrl(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAvatar();
  }, [user?.enterpriseId]);

  return {
    avatarUrl,
    loading,
    // 如果没有头像，返回undefined，让Avatar组件显示首字母头像
    src: avatarUrl || undefined
  };
};
