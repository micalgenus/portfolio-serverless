import DataStore from './index';
import { CategoryItemTable } from '@/interfaces';

class CategoryItemDatabase extends DataStore<CategoryItemTable> {
  constructor() {
    super('categoryItem');
  }
}

export default new CategoryItemDatabase();
