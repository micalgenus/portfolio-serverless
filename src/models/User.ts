import bcrypt from 'bcrypt';

import DataStore from './index';
import { UserTable } from '@/interfaces';
import { createToken, encryptDataWithRSA, decrypyDataWithRSA } from '@/controllers/auth';

import { cache, CACHE_EXPIRE } from '@/config';
import { getUserCacheKey } from '@/lib/utils/cache';

import { checkEmptyItems } from '@/lib/utils';
import * as UserUtils from '@/lib/utils/user';

class UserDatabase extends DataStore<UserTable> {
  constructor() {
    super('user');
  }

  static async updateCacheItem(id: string, info: UserTable) {
    const { _id, password, ...userInfo } = info;
    return cache.set(getUserCacheKey(id), JSON.stringify(userInfo), 'EX', CACHE_EXPIRE);
  }

  static async getCacheItem(id): Promise<UserTable> {
    const data = await cache.get(getUserCacheKey(id)).catch(() => null);
    if (data) return JSON.parse(data);
    return null;
  }

  static async createJwtToken({ _id, id, email, username }: UserTable): Promise<string> {
    return createToken({ _id, id: id, email, username });
  }

  async signup({ id, email, username, password }: UserTable): Promise<string> {
    // check empty values
    checkEmptyItems({ id, username, password, email });

    id = id.toLowerCase();

    // check invalid values
    if (!UserUtils.checkValidId(id)) throw new Error('Invalid id');
    if (!UserUtils.checkValidEmail(email)) throw new Error('Invalid email');
    if (!UserUtils.checkValidPassword(password)) throw new Error('Invalid password');

    // Check exist user id
    const { entities: existId } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (existId.length) throw new Error('Exist user id');

    // Check exist user email
    const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
    if (existEmail.length) throw new Error('Exist user email');

    // Create user
    const newUser = await this.create({ id, email, username, password: await bcrypt.hash(password, 10) });

    UserDatabase.updateCacheItem(id, newUser);

    return UserDatabase.createJwtToken({ ...newUser });
  }

  static async createRememberMeToken(user, password): Promise<string> {
    return encryptDataWithRSA(JSON.stringify({ user, password }));
  }

  static async decodeRememberMeToken(token): Promise<any> {
    return JSON.parse(decrypyDataWithRSA(token));
  }

  async rememberMe(user: string, password: string): Promise<string> {
    if (!user) throw new Error('required id');

    if (UserUtils.checkValidEmail(user)) await this.loginByEmail({ email: user, password });
    else await this.loginById({ id: user, password });

    return UserDatabase.createRememberMeToken(user, password);
  }

  async rememberMeLogin(token: string): Promise<string> {
    if (!token) throw new Error('Required token');

    const decoded = await UserDatabase.decodeRememberMeToken(token);
    if (!decoded) throw new Error('Invalid token');

    const { user, password } = decoded;
    return this.login({ user, password });
  }

  static async compareUserPasswordAndLogin(user, password = null): Promise<string> {
    if (!password) throw new Error('A password is required');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Incorrect password');

    return this.createJwtToken({ ...user });
  }

  async login({ user = '', password }): Promise<string> {
    if (UserUtils.checkValidEmail(user)) return this.loginByEmail({ email: user, password });
    return this.loginById({ id: user, password });
  }

  async loginById({ id, password }): Promise<string> {
    id = id.toLowerCase();
    // Check exist user id
    const { entities: existId } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (!existId.length) throw new Error('No user with that id');

    return UserDatabase.compareUserPasswordAndLogin(existId[0], password);
  }

  async loginByEmail({ email, password }): Promise<string> {
    email = email.toLowerCase();
    if (!UserUtils.checkValidEmail(email)) throw new Error('Invalid email');

    // Check exist user id
    const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
    if (!existEmail.length) throw new Error('No user with that email');

    return UserDatabase.compareUserPasswordAndLogin(existEmail[0], password);
  }

  async getUserInfoByPk(_id): Promise<UserTable> {
    if (!_id) throw new Error('Required id');

    const userinfo = await this.read(_id);
    if (!userinfo) throw new Error('User not found');

    UserDatabase.updateCacheItem(userinfo.id, userinfo);

    return userinfo;
  }

  async getUserInfoById(id): Promise<UserTable> {
    if (!id) throw new Error('Required id');

    const cacheItem = await UserDatabase.getCacheItem(id);
    if (cacheItem) return cacheItem;

    const { entities: existUser } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (!existUser.length) throw new Error('User not found');

    UserDatabase.updateCacheItem(existUser[0].id, existUser[0]);

    return existUser[0] || { id: undefined, email: undefined, username: undefined, password: undefined };
  }

  async updateUserInfo(id, { username, email, github, linkedin, description }: UserTable): Promise<UserTable> {
    if (!id) throw new Error('Required id');

    // Empty check
    if (username === undefined && email === undefined && github === undefined && linkedin === undefined && description === undefined)
      throw new Error('No information to update');
    if (username === '') throw new Error('Username must be required');

    // Get old user information
    const userInfo = await this.read(id);
    if (!userInfo) throw new Error('User not found');

    // Same data as before
    if (!UserUtils.isChangeUserDataWithBefore({ username, email, github, linkedin, description }, userInfo)) throw new Error('No information to update');

    if (email && email !== userInfo.email) {
      // Check exist user email
      const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
      if (existEmail.length) throw new Error('Exist user email');

      // Check valid email
      if (email && !UserUtils.checkValidEmail(email)) throw new Error('Invalid email');
    }

    // Update user information
    const updateData = {
      ...userInfo,
      username: (username === undefined ? userInfo.username : username) || '',
      email: (email === undefined ? userInfo.email : email) || '',
      github: (github === undefined ? userInfo.github : github) || '',
      linkedin: (linkedin === undefined ? userInfo.linkedin : linkedin) || '',
      description: ((description === undefined ? userInfo.description : description) || '').trim(),
    };

    const updateInfo = await this.update(id, updateData);
    if (!updateInfo) throw new Error('Fail user data update');

    UserDatabase.updateCacheItem(updateInfo.id, updateInfo);

    return updateInfo;
  }
}

export default new UserDatabase();
