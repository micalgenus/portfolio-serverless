import DataStore from './index';
import { CategoryTable } from '@/interfaces';

import { cache, CACHE_EXPIRE } from '@/config';
import { getCategoryCacheKey } from '@/lib/utils/cache';

import UserModel from './User';

class CategoryDatabase extends DataStore<CategoryTable> {
  constructor() {
    super('category');
  }

  static async updateCacheItem(id: string, info: CategoryTable[]): Promise<boolean> {
    const result = await cache.set(getCategoryCacheKey(id), JSON.stringify(info), 'EX', CACHE_EXPIRE);
    return result === 'OK';
  }

  static async getCacheItem(id): Promise<CategoryTable[]> {
    const data = await cache.get(getCategoryCacheKey(id)).catch(() => null);
    if (data) return JSON.parse(data);
    return null;
  }

  static async removeCacheItem(id: string): Promise<boolean> {
    const result = await cache.del(getCategoryCacheKey(id));
    return !!result;
  }

  async updateOrder(id: string, sequence: number): Promise<boolean> {
    if (!(sequence > 0)) throw new Error('Sequence must be positive integer');

    const category = await this.read(id);
    if (!category) throw new Error('Category not found');

    if (category.sequence === sequence) return true;
    category.sequence = sequence;

    // TODO: Update items with transaction
    const updated = await this.update(id, category);
    if (!updated) throw new Error('Fail category order update');
    return true;
  }

  async updateCategoriesOrder(user: string, categories: CategoryTable[]): Promise<boolean> {
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      if (c.sequence !== categories.length - i) {
        await this.updateOrder(c._id.toString(), categories.length - i);
        categories[i].sequence = categories.length - i;
      }
    }

    const result = await CategoryDatabase.updateCacheItem(user, categories);
    if (!result) throw new Error('Fail update categories sequence');
    return true;
  }

  async createNewCategory(user: string) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const createCategory = { user, sequence: 0, name: '' };

    const { _id } = await this.create(createCategory);
    if (!_id) throw new Error('Failed create category');

    const categories = [...(await this.getCategoryByUserId(user)), { _id: _id, ...createCategory }];
    await this.updateCategoriesOrder(user, categories);

    return _id;
  }

  async getCategoryByUserId(user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const cacheItem = await CategoryDatabase.getCacheItem(user);
    if (cacheItem) {
      if (!filter) return cacheItem;
      return cacheItem.filter(c => filter.includes(c._id.toString()));
    }

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    let { entities: categories } = await this.find([{ key: 'user', op: '=', value: user }], 'sequence', true);
    if (filter) categories = categories.filter(p => filter.includes(p._id.toString()));

    if (!filter) CategoryDatabase.updateCacheItem(user, categories);

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

    await CategoryDatabase.removeCacheItem(user);

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

    if (result) {
      const categories = await this.getCategoryByUserId(user);
      await this.updateCategoriesOrder(user, categories.filter(c => c._id.toString() !== id));
    }

    return result;
  }
}

export default new CategoryDatabase();
