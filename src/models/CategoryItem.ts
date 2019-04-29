import DataStore from './index';
import { CategoryItemTable } from '@/typings/database';

import { updateNewDataWithoutUndefined, checkEmptyItems, checkAllUndefinedValue, isChangeDataWithBefore } from '@/lib/utils';
import { getCategoryItemCacheKey, returnCacheItemWithFilterOfArrayItems, updateCacheItem, getCacheItem, removeCacheItem } from '@/lib/utils/cache';

import CategoryModel from './Category';
import { updateItemsOrder, updateOrder } from '@/lib/utils/order';

class CategoryItemDatabase extends DataStore<CategoryItemTable> {
  constructor() {
    super('categoryItem');
  }

  async updateItemsOrder(category: string, items: CategoryItemTable[]) {
    return updateItemsOrder(category, items, this, getCategoryItemCacheKey);
  }

  /**
   *
   * @param category category._id
   * @param user user.id
   * @return {string} item._id
   */
  async createItemForCategory(category: string, user: string) {
    checkEmptyItems({ user });
    await CategoryModel.checkExistCategoryByUserId(user, [category]);

    const createCategoryItem = { category, name: '', description: '', sequence: 0 };

    const beforeItems = await this.getItemsByCategory(category, user);
    const { _id } = await this.create(createCategoryItem);
    if (!_id) throw new Error('Failed create category item');

    const items = [...beforeItems, { _id: _id, ...createCategoryItem }];
    await this.updateItemsOrder(category, items);

    return _id;
  }

  async findAndUpdateCacheItemWithFilter(category: string, filter?: string[]): Promise<CategoryItemTable[]> {
    let { entities: items } = await this.find([{ key: 'category', op: '=', value: category }], 'sequence', true);
    if (filter) items = items.filter(p => filter.includes(p._id.toString()));

    if (!filter) await updateCacheItem(category, items, getCategoryItemCacheKey);
    return items || [];
  }

  async getItemsByCategory(category: string, user: string, filter?: string[]) {
    checkEmptyItems({ user });

    const cacheItem = await getCacheItem<CategoryItemTable[]>(category, getCategoryItemCacheKey);
    if (cacheItem) return returnCacheItemWithFilterOfArrayItems(cacheItem, filter);

    const existCategory = await CategoryModel.checkExistCategoryByUserId(user, [category]);

    return this.findAndUpdateCacheItemWithFilter(existCategory._id.toString(), filter);
  }

  async removeCategoryItemById(id: string, category: string, user: string) {
    checkEmptyItems({ id, category, user });

    const existCategory = await CategoryModel.checkExistCategoryByUserId(user, [category]);
    if (existCategory.user !== user) throw new Error('Permission denied');

    const item = await this.read(id);
    if (!item) throw new Error('Category item not found');

    if (item.category !== category) throw new Error('Category does not contain this item');

    const result = !!this.delete(id);

    if (result) {
      const items = (await this.getItemsByCategory(category, user)).filter(c => c._id.toString() !== id);
      await this.updateItemsOrder(category, items);
    }

    return result;
  }

  async updateCategoryItem(id: string, category: string, user: string, { name, description }: CategoryItemTable): Promise<CategoryItemTable> {
    checkEmptyItems({ id, category });
    checkAllUndefinedValue({ name, description });

    const [item] = await this.getItemsByCategory(category, user, [id]);
    if (!item) throw new Error('Category item not found');

    // Same data as before
    if (!isChangeDataWithBefore({ name, description }, item)) throw new Error('No information to update');

    const updateData = updateNewDataWithoutUndefined(item, { name, description });

    // TODO: Update items with transaction
    const updated = await this.update(id, updateData);
    if (!updated) throw new Error('Fail category item data update');

    await removeCacheItem(category, getCategoryItemCacheKey);

    return updated;
  }

  async orderingSequences(items: CategoryItemTable[], sequences: { _id: string; sequence: number }[]): Promise<CategoryItemTable[]> {
    for (const sequence of sequences) {
      const result = await updateOrder(sequence._id, sequence.sequence, this);
      if (!result) throw new Error('Fail update category sequence');

      for (const item of items) {
        if (item._id.toString() === sequence._id.toString()) item.sequence = sequence.sequence;
      }
    }

    items.sort((a, b) => b.sequence - a.sequence);
    return items;
  }

  async updateCategoryItemSequence(category: string, user: string, sequences: { _id: string; sequence: number }[]) {
    checkEmptyItems({ category, sequences });

    await CategoryModel.checkExistCategoryByUserId(user, [category]);

    const items = await this.getItemsByCategory(category, user);
    const orderedItems = await this.orderingSequences(items, sequences);

    await this.updateItemsOrder(category, orderedItems);
    return true;
  }
}

export default new CategoryItemDatabase();
