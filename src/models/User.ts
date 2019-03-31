import bcrypt from 'bcrypt';

import DataStore from './index';
import { UserTable } from '@/interfaces';
import { createToken } from '@/controllers/auth';

import { checkEmptyItems } from '@/lib/utils';
import { checkValidId, checkValidEmail, checkValidPassword } from '@/lib/utils/user';

class UserDatabase extends DataStore {
  constructor() {
    super('user');
  }

  static async createJwtToken({ _id, id, email, username }) {
    return createToken({ _id, id: id, email, username });
  }

  async signup({ id, email, username, password }: UserTable) {
    // check empty values
    checkEmptyItems({ id, username, password, email });

    id = id.toLowerCase();

    // check invalid values
    if (!checkValidId(id)) throw new Error('Invalid id');
    if (!checkValidEmail(email)) throw new Error('Invalid email');
    if (!checkValidPassword(password)) throw new Error('Invalid password');

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

  static async compareUserPasswordAndLogin(user, password = null) {
    if (!password) throw new Error('A password is required');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Incorrect password');

    return this.createJwtToken({ ...user });
  }

  async login({ user = '', password }) {
    if (checkValidEmail(user)) return this.loginByEmail({ email: user, password });
    return this.loginById({ id: user, password });
  }

  async loginById({ id, password }) {
    id = id.toLowerCase();
    // Check exist user id
    const { entities: existId } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (!existId.length) throw new Error('No user with that id');

    return UserDatabase.compareUserPasswordAndLogin(existId[0], password);
  }

  async loginByEmail({ email, password }) {
    email = email.toLowerCase();
    if (!checkValidEmail(email)) throw new Error('Invalid email');

    // Check exist user id
    const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
    if (!existEmail.length) throw new Error('No user with that email');

    return UserDatabase.compareUserPasswordAndLogin(existEmail[0], password);
  }

  async getUserInfoByPk(id) {
    if (!id) throw new Error('Required id');

    const userinfo = await this.read(id);
    if (!userinfo) throw new Error('User not found');

    return userinfo;
  }

  async getUserInfoById(id) {
    if (!id) throw new Error('Required id');

    const { entities: existUser } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (!existUser.length) throw new Error('User not found');

    return existUser[0] || {};
  }

  async updateUserInfo(id, username, email, github, linkedin) {
    if (!id) throw new Error('Required id');

    // Empty check
    if (username === undefined && email === undefined && github === undefined && linkedin === undefined) throw new Error('No information to update');
    if (username === '') throw new Error('Username must be required');

    // Get old user information
    const userInfo = await this.read(id);
    if (!userInfo) throw new Error('User not found');

    // Same data as before
    if (username === userInfo.username && email === userInfo.email && github === userInfo.github && linkedin === userInfo.linkedin)
      throw new Error('No information to update');

    if (email !== userInfo.email) {
      // Check exist user email
      const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
      if (existEmail.length) throw new Error('Exist user email');

      // Check valid email
      if (email && !checkValidEmail(email)) throw new Error('Invalid email');
    }

    // Update user information
    const updateData = {
      ...userInfo,
      username: username === undefined ? userInfo.username : username,
      email: email === undefined ? userInfo.email : email,
      github: github === undefined ? userInfo.github : github,
      linkedin: linkedin === undefined ? userInfo.linkedin : linkedin,
    };

    const updateInfo = await this.update(id, updateData);
    if (!updateInfo) throw new Error('Fail user data update');

    return updateInfo;
  }
}

export default new UserDatabase();
