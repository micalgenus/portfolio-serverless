import { TableTemplate } from '@/typings/database';
import { cache, CACHE_EXPIRE } from '@/config';

export const getUserCacheKey = (id: string) => `user:${id}`;
export const getCategoryCacheKey = (id: string) => `category:${id}`;
export const getCategoryItemCacheKey = (id: string) => `categoryItem:${id}`;

const USE_CACHE = false;

/**
 * @param items Caching data
 * @param filter Array of _id in items
 * @return {T[]} Array of filtering data
 */
export const returnCacheItemWithFilterOfArrayItems = <T extends TableTemplate>(items: T[], filter?: string[]): T[] => {
  if (!filter) return items;
  return items.filter(c => filter.includes(c._id.toString()));
};

export const updateCacheItem = async <T extends TableTemplate>(id: string, items: T | T[], getKey: (id: string) => string): Promise<boolean> => {
  if (USE_CACHE) {
    const result = await cache.set(getKey(id), JSON.stringify(items), 'EX', CACHE_EXPIRE);
    return result === 'OK';
  } else {
    return true;
  }
};

export const getCacheItem = async <T extends TableTemplate | Array<TableTemplate>>(id: string, getKey: (id: string) => string): Promise<T> => {
  if (USE_CACHE) {
    const data = await cache.get(getKey(id)).catch(() => null);
    if (data) return JSON.parse(data);
    return null;
  } else {
    return null;
  }
};

export const removeCacheItem = async (id: string, getKey: (id: string) => string): Promise<boolean> => {
  if (USE_CACHE) {
    const result = await cache.del(getKey(id));
    return !!result;
  } else {
    return true;
  }
};
