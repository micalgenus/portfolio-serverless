import DataStore from './index';
import { CategoryTable } from '@/interfaces';

import UserModel from './User';

class CategoryDatabase extends DataStore<CategoryTable> {
  constructor() {
    super('category');
  }

  async createNewCategory(user: string) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const { _id } = await this.create({ user });
    if (!_id) throw new Error('Failed create portfolio');

    return _id;
  }

  async getCategoryByUserId(user: string, filter?: string[]) {
    if (!user) throw new Error('Required user');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    let { entities: categories } = await this.find([{ key: 'user', op: '=', value: user }]);
    if (filter) categories = categories.filter(p => filter.includes(p._id.toString()));

    return categories || [];
  }

  async updateCategory(id: string, user: string, { name }: CategoryTable) {
    if (!id || !user) throw new Error('Required id and user');

    if (name === undefined) throw new Error('No information to update');

    const existUser = await UserModel.getUserInfoById(user);
    if (!existUser) throw new Error('User not found');

    const category = await this.read(id);
    if (!category) throw new Error('Category not found');

    // Same data as before
    if (name === category.name) throw new Error('No information to update');

    if (category.user !== user) throw new Error('Permission denied');

    const updateData = {
      user: category.user,
      name: name === undefined ? category.name : name,
    };

    // TODO: Update items with transaction
    const updated = await this.update(id, updateData);
    if (!updated) throw new Error('Fail category data update');

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
    return !!this.delete(id);
  }
}

export default new CategoryDatabase();
