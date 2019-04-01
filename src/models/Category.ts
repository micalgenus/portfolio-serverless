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
}

export default new CategoryDatabase();
