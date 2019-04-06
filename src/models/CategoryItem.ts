import DataStore from './index';
import { CategoryItemTable } from '@/interfaces';

import { cache, CACHE_EXPIRE } from '@/config';
import { getCategoryItemCacheKey } from '@/lib/utils/cache';

import UserModel from './User';
import CategoryModel from './Category';

class CategoryItemDatabase extends DataStore<CategoryItemTable> {
  constructor() {
    super('categoryItem');
  }

  static async updateCacheItem(id: string, items: CategoryItemTable[]): Promise<boolean> {
    const result = await cache.set(getCategoryItemCacheKey(id), JSON.stringify(items), 'EX', CACHE_EXPIRE);
    return result === 'OK';
  }

  static async getCacheItem(id): Promise<CategoryItemTable[]> {
    const data = await cache.get(getCategoryItemCacheKey(id)).catch(() => null);
    if (data) return JSON.parse(data);
    return null;
  }

  async updateOrder(id: string, sequence: number): Promise<boolean> {
    if (!(sequence > 0)) throw new Error('Sequence must be positive integer');

    const item = await this.read(id);
    if (!item) throw new Error('Category not found');

    if (item.sequence === sequence) return true;
    item.sequence = sequence;

    // TODO: Update items with transaction
    const updated = await this.update(id, item);
    if (!updated) throw new Error('Fail category order update');
    return true;
  }

  async updateItemsOrder(user: string, items: CategoryItemTable[]): Promise<boolean> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.sequence !== items.length - i) {
        await this.updateOrder(item._id.toString(), items.length - i);
        items[i].sequence = items.length - i;
      }
    }

    const result = await CategoryItemDatabase.updateCacheItem(user, items);
    if (!result) throw new Error('Fail update category items sequence');
    return true;
  }

  ///////////////////////////////////////////////////////////////////////////
  //                                Methods                                //
  ///////////////////////////////////////////////////////////////////////////

  /**
   *
   * @param category category._id
   * @param user user.id
   * @return {string} item._id
   */

  async createItemForCategory(category: string, user: string) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const [existCategory] = await CategoryModel.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    const createCategoryItem = { category, name: '', description: '', sequence: 0 };

    const { _id } = await this.create(createCategoryItem);
    if (!_id) throw new Error('Failed create category item');

    const items = [...(await this.getItemsByCategory(category, user)), { _id: _id, ...createCategoryItem }];
    await this.updateItemsOrder(user, items);

    return _id;
  }

  async getItemsByCategory(category: string, user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const [existCategory] = await CategoryModel.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    const cacheItem = await CategoryItemDatabase.getCacheItem(existCategory._id);
    if (cacheItem) {
      if (!filter) return cacheItem;
      return cacheItem.filter(c => filter.includes(c._id.toString()));
    }

    let { entities: items } = await this.find([{ key: 'category', op: '=', value: existCategory._id }], 'sequence', true);
    if (filter) items = items.filter(p => filter.includes(p._id.toString()));

    if (!filter) await CategoryItemDatabase.updateCacheItem(user, items);
    return items || [];
  }
}

export default new CategoryItemDatabase();
