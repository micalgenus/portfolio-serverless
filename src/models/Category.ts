import DataStore from './index';
import { CategoryTable } from '@/typings/database';

import { updateNewDataWithoutUndefined, isChangeDataWithBefore, checkEmptyItems, checkAllUndefinedValue } from '@/lib/utils';
import { getCategoryCacheKey, returnCacheItemWithFilterOfArrayItems, updateCacheItem, getCacheItem, removeCacheItem } from '@/lib/utils/cache';
import { updateItemsOrder, orderingSequences } from '@/lib/utils/order';

import UserModel from './User';
import CategoryItemModel from './CategoryItem';

class CategoryDatabase extends DataStore<CategoryTable> {
  constructor() {
    super('category');
  }

  ///////////////////////////////////////////////////////////////////////////
  //                                Methods                                //
  ///////////////////////////////////////////////////////////////////////////

  async updateItemsOrder(user: string, categories: CategoryTable[]) {
    return updateItemsOrder(user, categories, this, getCategoryCacheKey);
  }

  /**
   * @param user from user._id
   * @return {string} category._id
   */
  async createNewCategory(user: string) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const createCategory = { user, sequence: 0, name: '' };

    const beforeCategories = await this.getCategoryByUserId(user);
    const { _id } = await this.create(createCategory);
    if (!_id) throw new Error('Failed create category');

    const categories = [...beforeCategories, { _id: _id, ...createCategory }];
    await this.updateItemsOrder(user, categories);

    return _id;
  }

  async checkExistCategoryByCategoryId(user: string, category: string): Promise<CategoryTable> {
    const [existCategory] = await this.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    return existCategory;
  }

  async getCategoryByUserId(user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const cacheItem = await getCacheItem<CategoryTable[]>(user, getCategoryCacheKey);
    if (cacheItem) return returnCacheItemWithFilterOfArrayItems(cacheItem, filter);

    await UserModel.getUserInfoById(user);

    let { entities: categories } = await this.find([{ key: 'user', op: '=', value: user }], 'sequence', true);
    if (filter) categories = categories.filter(p => filter.includes(p._id.toString()));

    if (!filter) await updateCacheItem(user, categories, getCategoryCacheKey);

    return categories || [];
  }

  async updateCategory(id: string, user: string, { name, sequence }: CategoryTable) {
    checkEmptyItems({ id, user });
    checkAllUndefinedValue({ name, sequence });

    const category = await this.checkExistCategoryByCategoryId(user, id);
    if (category.user !== user) throw new Error('Permission denied');

    // Same data as before
    if (!isChangeDataWithBefore({ name, sequence }, category)) throw new Error('No information to update');

    const updateData = updateNewDataWithoutUndefined(category, { name, sequence });

    // TODO: Update items with transaction
    const updated = await this.update(id, updateData);
    if (!updated) throw new Error('Fail category data update');

    await removeCacheItem(user, getCategoryCacheKey);

    return updated;
  }

  async updateCategorySequence(user: string, sequences: { _id: string; sequence: number }[]) {
    checkEmptyItems({ user, sequences });

    const categories = await this.getCategoryByUserId(user);
    const orderedItems = await orderingSequences(categories, sequences);

    await this.updateItemsOrder(user, orderedItems);

    return true;
  }

  async removeCategoryById(id: string, user: string) {
    checkEmptyItems({ id, user });

    const category = await this.checkExistCategoryByCategoryId(user, id);
    if (category.user !== user) throw new Error('Permission denied');

    // TODO: with transaction for items...
    const items = await CategoryItemModel.getItemsByCategory(id, user);
    for (const item of items) {
      const result = await CategoryItemModel.removeCategoryItemById(item._id.toString(), id, user);
      if (!result) throw new Error('Fail remove category');
    }

    const result = !!(await this.delete(id));

    if (result) {
      const categories = (await this.getCategoryByUserId(user)).filter(c => c._id.toString() !== id);
      await this.updateItemsOrder(user, categories);
    }

    return result;
  }
}

export default new CategoryDatabase();
