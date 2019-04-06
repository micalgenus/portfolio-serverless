import DataStore from './index';
import { CategoryTable } from '@/interfaces';

import { getCategoryCacheKey, returnCacheItemWithFilterOfArrayItems, updateCacheItems, getCacheItems, removeCacheItem } from '@/lib/utils/cache';
import { updateItemsOrder, updateOrder } from '@/lib/utils/order';

import UserModel from './User';

class CategoryDatabase extends DataStore<CategoryTable> {
  constructor() {
    super('category');
  }

  ///////////////////////////////////////////////////////////////////////////
  //                                Methods                                //
  ///////////////////////////////////////////////////////////////////////////

  /**
   * @param user from user._id
   * @return {string} category._id
   */
  async createNewCategory(user: string) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const createCategory = { user, sequence: 0, name: '' };

    const { _id } = await this.create(createCategory);
    if (!_id) throw new Error('Failed create category');

    const categories = [...(await this.getCategoryByUserId(user)), { _id: _id, ...createCategory }];
    await updateItemsOrder(
      user,
      categories,
      id => this.read(id),
      (id, data) => this.update(id, data),
      (id, items) => updateCacheItems(id, items, getCategoryCacheKey)
    );

    return _id;
  }

  async getCategoryByUserId(user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const cacheItem = await getCacheItems<CategoryTable>(user, getCategoryCacheKey);
    if (cacheItem) return returnCacheItemWithFilterOfArrayItems(cacheItem, filter);

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    let { entities: categories } = await this.find([{ key: 'user', op: '=', value: user }], 'sequence', true);
    if (filter) categories = categories.filter(p => filter.includes(p._id.toString()));

    if (!filter) await updateCacheItems(user, categories, getCategoryCacheKey);

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
    await updateItemsOrder(
      user,
      categories,
      id => this.read(id),
      (id, data) => this.update(id, data),
      (id, items) => updateCacheItems(id, items, getCategoryCacheKey)
    );
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
    // TODO: with remove category children items
    const result = !!this.delete(id);

    if (result) {
      const categories = (await this.getCategoryByUserId(user)).filter(c => c._id.toString() !== id);
      await updateItemsOrder(
        user,
        categories,
        id => this.read(id),
        (id, data) => this.update(id, data),
        (id, items) => updateCacheItems(id, items, getCategoryCacheKey)
      );
    }

    return result;
  }
}

export default new CategoryDatabase();
