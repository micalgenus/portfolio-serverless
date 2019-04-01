import DataStore from './index';
import { CategoryTable } from '@/interfaces';

import UserModel from './User';

class CategoryDatabase extends DataStore<CategoryTable> {
  constructor() {
    super('category');
  }
}

export default new CategoryDatabase();
