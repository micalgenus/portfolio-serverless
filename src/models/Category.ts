import DataStore from './index';
import { CategoryTable } from '@/interfaces';

import { cache, CACHE_EXPIRE } from '@/config';
import { getCategoryCacheKey } from '@/lib/utils/cache';

import UserModel from './User';

class CategoryDatabase extends DataStore<CategoryTable> {
  constructor() {
    super('category');
  }

  static async updateCacheItem(id: string, info: CategoryTable[]) {
    cache.set(getCategoryCacheKey(id), JSON.stringify(info), 'EX', CACHE_EXPIRE);
  }

  static async getCacheItem(id): Promise<CategoryTable[]> {
    const data = await cache.get(getCategoryCacheKey(id)).catch(() => null);
    if (data) return JSON.parse(data);
    return null;
  }

  static async removeCacheItem(id: string) {
    cache.del(getCategoryCacheKey(id));
  }

  async updateOrder(id: string, sequence: number) {
    const category = await this.read(id);
    if (!category) throw new Error('Category not found');

    const updateData = {
      ...category,
      sequence: sequence,
    };

    // TODO: Update items with transaction
    const updated = await this.update(id, updateData);
    if (!updated) throw new Error('Fail category data update');
  }

  async updateCategoriesOrder(user: string) {
    const categories = await this.getCategoryByUserId(user);
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      if (c.sequence !== categories.length - i) await this.updateOrder(c._id, categories.length - i);
    }

    CategoryDatabase.removeCacheItem(user);
  }

  async createNewCategory(user: string) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const { _id } = await this.create({ user, sequence: 0, name: '' });
    if (!_id) throw new Error('Failed create category');

    await this.updateCategoriesOrder(user);

    return _id;
  }

  async getCategoryByUserId(user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const cacheItem = await CategoryDatabase.getCacheItem(user);
    if (cacheItem) return cacheItem;

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    let { entities: categories } = await this.find([{ key: 'user', op: '=', value: user }], 'sequence', true);
    if (filter) categories = categories.filter(p => filter.includes(p._id.toString()));

    CategoryDatabase.updateCacheItem(user, categories);

    return categories || [];
  }

  async updateCategory(id: string, user: string, { name, sequence }: CategoryTable) {
    if (!id || !user) throw new Error('Required id and user');

    if (name === undefined && sequence === undefined) throw new Error('No information to update');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const category = await this.read(id);
    if (!category) throw new Error('Category not found');

    // Same data as before
    if (name === category.name && sequence === category.sequence) throw new Error('No information to update');

    if (category.user !== user) throw new Error('Permission denied');

    const updateData = {
      ...category,
      name: name === undefined ? category.name : name,
      sequence: sequence === undefined ? category.sequence : sequence,
    };

    // TODO: Update items with transaction
    const updated = await this.update(id, updateData);
    if (!updated) throw new Error('Fail category data update');

    CategoryDatabase.removeCacheItem(user);

    return updated;
  }

  async removeCategoryById(id: string, user: string) {
    if (!id || !user) throw new Error('Required id and user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const category = await this.read(id);
    if (!category) throw new Error('Category not found');

    if (category.user !== user) throw new Error('Permission denied');

    // TODO: with transaction for items...
    const result = !!this.delete(id);

    if (result) await this.updateCategoriesOrder(user);
    return result;
  }
}

export default new CategoryDatabase();
