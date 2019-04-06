import { TableTemplate } from '@/interfaces';
import { cache, CACHE_EXPIRE } from '@/config';

export const getUserCacheKey = (id: string) => `user:${id}`;
export const getCategoryCacheKey = (id: string) => `category:${id}`;
export const getCategoryItemCacheKey = (id: string) => `categoryItem:${id}`;

export const returnCacheItemWithFilterOfArrayItems = <T extends TableTemplate>(items: T[], filter?: string[]): T[] => {
  if (!filter) return items;
  return items.filter(c => filter.includes(c._id.toString()));
};

export const updateCacheItems = async <T extends TableTemplate>(id: string, items: T[], getKey: (id: string) => string): Promise<boolean> => {
  const result = await cache.set(getKey(id), JSON.stringify(items), 'EX', CACHE_EXPIRE);
  return result === 'OK';
};

export const getCacheItems = async <T extends TableTemplate>(id: string, getKey: (id: string) => string): Promise<T[]> => {
  const data = await cache.get(getKey(id)).catch(() => null);
  if (data) return JSON.parse(data);
  return null;
};

export const removeCacheItem = async (id: string, getKey: (id: string) => string): Promise<boolean> => {
  const result = await cache.del(getKey(id));
  return !!result;
};
