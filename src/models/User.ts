import DataStore from './index';

class UserDatabase extends DataStore {
  constructor() {
    super('user');
  }
}

export default new UserDatabase();
