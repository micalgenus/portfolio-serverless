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
