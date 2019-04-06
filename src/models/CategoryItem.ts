import DataStore from './index';
import { CategoryItemTable } from '@/interfaces';

import { getCategoryItemCacheKey, returnCacheItemWithFilterOfArrayItems, updateCacheItems, getCacheItems } from '@/lib/utils/cache';

import UserModel from './User';
import CategoryModel from './Category';
import { updateItemsOrder } from '@/lib/utils/order';

class CategoryItemDatabase extends DataStore<CategoryItemTable> {
  constructor() {
    super('categoryItem');
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
    await updateItemsOrder(
      user,
      items,
      id => this.read(id),
      (id, data) => this.update(id, data),
      (id, items) => updateCacheItems(id, items, getCategoryItemCacheKey)
    );

    return _id;
  }

  async getItemsByCategory(category: string, user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const [existCategory] = await CategoryModel.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    const cacheItem = await getCacheItems(existCategory._id.toString(), getCategoryItemCacheKey);
    if (cacheItem) return returnCacheItemWithFilterOfArrayItems(cacheItem, filter);

    let { entities: items } = await this.find([{ key: 'category', op: '=', value: existCategory._id }], 'sequence', true);
    if (filter) items = items.filter(p => filter.includes(p._id.toString()));

    if (!filter) await updateCacheItems(user, items, getCategoryItemCacheKey);
    return items || [];
  }
}

export default new CategoryItemDatabase();
