import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import type { User, AuthState } from '../types';
import { validateToken } from '../utils/authUtils';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      
      logout: async () => {
        // 先清除本地状态，防止API调用失败时的错误提示
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        try {
          // 调用后端API使token失效（在清除本地状态后调用）
          await authAPI.logout();
        } catch (error) {
          console.error('登出API调用失败:', error);
          // 本地状态已清除，忽略API错误
        }
      },
      
      updateUser: (user: User) => {
        set({ user });
      },
      
      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),
      
      initialize: () => {
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // 在状态恢复时验证令牌
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 重新验证令牌
          if (state.token && state.user) {
            const isTokenValid = validateToken(state.token);
            if (!isTokenValid) {
              // 直接修改状态，不调用set方法
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
              // 清理localStorage
              localStorage.removeItem('auth-storage');
            }
          }
        }
      },
    }
  )
);

 