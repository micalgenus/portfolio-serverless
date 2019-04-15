import DataStore from './index';
import { CategoryItemTable } from '@/interfaces';

import { getCategoryItemCacheKey, returnCacheItemWithFilterOfArrayItems, updateCacheItem, getCacheItem, removeCacheItem } from '@/lib/utils/cache';

import UserModel from './User';
import CategoryModel from './Category';
import { updateItemsOrder, updateOrder } from '@/lib/utils/order';

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

    const beforeItems = await this.getItemsByCategory(category, user);
    const { _id } = await this.create(createCategoryItem);
    if (!_id) throw new Error('Failed create category item');

    const items = [...beforeItems, { _id: _id, ...createCategoryItem }];
    await updateItemsOrder(
      category,
      items,
      id => this.read(id),
      (id, data) => this.update(id, data),
      (id, items) => updateCacheItem(id, items, getCategoryItemCacheKey)
    );

    return _id;
  }

  async getItemsByCategory(category: string, user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const [existCategory] = await CategoryModel.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    const cacheItem = await getCacheItem<CategoryItemTable[]>(category, getCategoryItemCacheKey);
    if (cacheItem) return returnCacheItemWithFilterOfArrayItems(cacheItem, filter);

    let { entities: items } = await this.find([{ key: 'category', op: '=', value: existCategory._id }], 'sequence', true);
    if (filter) items = items.filter(p => filter.includes(p._id.toString()));

    if (!filter) await updateCacheItem(category, items, getCategoryItemCacheKey);
    return items || [];
  }

  async removeCategoryItemById(id: string, category: string, user: string) {
    if (!id || !category || !user) throw new Error('Required id, category and user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const [existCategory] = await CategoryModel.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    if (existCategory.user !== user) throw new Error('Permission denied');

    const item = await this.read(id);
    if (!item) throw new Error('Category item not found');

    if (item.category !== category) throw new Error('Category does not contain this item');

    const result = !!this.delete(id);

    if (result) {
      const items = (await this.getItemsByCategory(category, user)).filter(c => c._id.toString() !== id);
      await updateItemsOrder(
        category,
        items,
        id => this.read(id),
        (id, data) => this.update(id, data),
        (id, data) => updateCacheItem(id, data, getCategoryItemCacheKey)
      );
    }

    return result;
  }

  async updateCategoryItem(id: string, category: string, user: string, { name, description }: CategoryItemTable): Promise<CategoryItemTable> {
    if (!id || !category) throw new Error('Required id and category');
    if (name === undefined && description === undefined) throw new Error('No information to update');

    const [item] = await this.getItemsByCategory(category, user, [id]);
    if (!item) throw new Error('Category item not found');

    // Same data as before
    if (name === item.name && description === item.description) throw new Error('No information to update');

    const updateData = {
      ...item,
      name: name === undefined ? item.name : name,
      description: description === undefined ? item.description : description,
    };

    // TODO: Update items with transaction
    const updated = await this.update(id, updateData);
    if (!updated) throw new Error('Fail category item data update');

    await removeCacheItem(category, getCategoryItemCacheKey);

    return updated;
  }

  async updateCategoryItemSequence(category: string, user: string, sequences: { _id: string; sequence: number }[]) {
    if (!category) throw new Error('Required category');
    if (sequences.length === 0) throw new Error('Requires that the sequences is not empty');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const [existCategory] = await CategoryModel.getCategoryByUserId(user, [category]);
    if (!existCategory) throw new Error('Category not found');

    const items = await this.getItemsByCategory(category, user);
    for (const sequence of sequences) {
      const result = await updateOrder(sequence._id, sequence.sequence, id => this.read(id), (id, data) => this.update(id, data));
      if (!result) throw new Error('Fail update category sequence');

      for (const item of items) {
        if (item._id.toString() === sequence._id.toString()) item.sequence = sequence.sequence;
      }
    }

    items.sort((a, b) => b.sequence - a.sequence);
    await updateItemsOrder(
      category,
      items,
      id => this.read(id),
      (id, data) => this.update(id, data),
      (id, data) => updateCacheItem(id, data, getCategoryItemCacheKey)
    );
    return true;
  }
}

export default new CategoryItemDatabase();
