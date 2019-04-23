import DataStore from './index';
import { CategoryTable } from '@/typings/database';

import { getCategoryCacheKey, returnCacheItemWithFilterOfArrayItems, updateCacheItem, getCacheItem, removeCacheItem } from '@/lib/utils/cache';
import { updateItemsOrder, updateOrder } from '@/lib/utils/order';

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
    return updateItemsOrder(
      user,
      categories,
      id => this.read(id),
      (id, data) => this.update(id, data),
      (id, items) => updateCacheItem(id, items, getCategoryCacheKey)
    );
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

  async getCategoryByUserId(user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const cacheItem = await getCacheItem<CategoryTable[]>(user, getCategoryCacheKey);
    if (cacheItem) return returnCacheItemWithFilterOfArrayItems(cacheItem, filter);

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    let { entities: categories } = await this.find([{ key: 'user', op: '=', value: user }], 'sequence', true);
    if (filter) categories = categories.filter(p => filter.includes(p._id.toString()));

    if (!filter) await updateCacheItem(user, categories, getCategoryCacheKey);

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

    await removeCacheItem(user, getCategoryCacheKey);

    return updated;
  }

  async updateCategorySequence(user: string, sequences: { _id: string; sequence: number }[]) {
    if (sequences.length === 0) throw new Error('Requires that the sequences is not empty');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const categories = await this.getCategoryByUserId(user);
    for (const sequence of sequences) {
      const result = await updateOrder(sequence._id, sequence.sequence, id => this.read(id), (id, data) => this.update(id, data));

      if (!result) throw new Error('Fail update category sequence');

      for (const category of categories) {
        if (category._id === sequence._id) category.sequence = sequence.sequence;
      }
    }

    categories.sort((a, b) => b.sequence - a.sequence);
    await this.updateItemsOrder(user, categories);

    return true;
  }

  async removeCategoryById(id: string, user: string) {
    if (!id || !user) throw new Error('Required id and user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const category = await this.read(id);
    if (!category) throw new Error('Category not found');

    if (category.user !== user) throw new Error('Permission denied');

    // TODO: with transaction for items...
    const items = await CategoryItemModel.getItemsByCategory(id, user);
    for (const item of items) {
      const result = await CategoryItemModel.removeCategoryItemById(item._id.toString(), id, user);
      if (!result) throw new Error('Fail remove category');
    }

    const result = !!this.delete(id);

    if (result) {
      const categories = (await this.getCategoryByUserId(user)).filter(c => c._id.toString() !== id);
      await this.updateItemsOrder(user, categories);
    }

    return result;
  }
}

export default new CategoryDatabase();
