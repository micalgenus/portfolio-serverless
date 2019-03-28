import bcrypt from 'bcrypt';

import DataStore from './index';
import { UserTable } from '@/interfaces';
import { createToken } from '@/controllers/auth';

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class UserDatabase extends DataStore {
  constructor() {
    super('user');
  }

  static async createJwtToken({ _id, id, email, username }) {
    return createToken({ _id, id: id, email, username });
  }

  async signup({ id, email, username, password }: UserTable) {
    // check valid values
    if (!id) throw new Error('Invalid id');
    if (!username) throw new Error('Invalid username');
    if (!password) throw new Error('Invalid password');
    if (!email || !emailRegex.test(email)) throw new Error('Invalid email');

    // Check exist user id
    const { entities: existId } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (existId.length) throw new Error('Exist user id');

    // Check exist user email
    const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
    if (existEmail.length) throw new Error('Exist user email');

    // Create user
    const newUser = await this.create({ id, email, username, password: await bcrypt.hash(password, 10) });

    return UserDatabase.createJwtToken({ ...newUser });
  }
}

export default new UserDatabase();
