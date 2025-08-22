import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并CSS类名的工具函数
 * 使用clsx进行条件类名处理，使用tailwind-merge进行Tailwind类名去重
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
