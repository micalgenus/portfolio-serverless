import bcrypt from 'bcrypt';
import randomstring from 'randomstring';

import DataStore from './index';
import { UserTable, OAuth } from '@/typings/database';
import { createToken, encryptDataWithRSA, decrypyDataWithRSA, verify } from '@/controllers/auth';

import { getUserCacheKey, updateCacheItem, getCacheItem } from '@/lib/utils/cache';

import { checkEmptyItems, checkAllUndefinedValue, updateNewDataWithoutUndefined } from '@/lib/utils';
import * as UserUtils from '@/lib/utils/user';

class UserDatabase extends DataStore<UserTable> {
  constructor() {
    super('user');
  }

  static async createJwtToken({ _id, id, email, username }: UserTable, type?: OAuth): Promise<string> {
    return createToken({ _id, id: id, email, username, type: type || 'LOCAL' });
  }

  async signup({ id, email, username, password }: UserTable): Promise<string> {
    // check empty values
    checkEmptyItems({ id, password });

    id = id.toLowerCase();

    // check invalid id
    if (!UserUtils.checkValidId(id)) throw new Error('Invalid id');

    // Check exist user id
    const { entities: existId } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (existId.length) throw new Error('Exist user id');

    // Check exist user email
    if (email) {
      const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: email }]);
      if (existEmail.length) throw new Error('Exist user email');
    }

    // Create user
    const newUser = await this.create({ id, email: email || '', username: username || '', password });

    updateCacheItem(id, newUser, getUserCacheKey);

    return UserDatabase.createJwtToken({ ...newUser });
  }

  async signupLocal({ id, email, username, password }: UserTable): Promise<string> {
    // check empty values
    checkEmptyItems({ id, username, password, email });

    // check invalid values
    if (!UserUtils.checkValidEmail(email)) throw new Error('Invalid email');
    if (!UserUtils.checkValidPassword(password)) throw new Error('Invalid password');

    return this.signup({ id, email, username, password: await bcrypt.hash(password, 10) });
  }

  async signupOAuth(type: OAuth, { id, email, password, ...userInfo }: UserTable): Promise<string> {
    let newId, exist;

    do {
      newId = randomstring.generate({ length: 20, charset: 'alphabetic' });
      exist = (await this.find([{ key: 'id', op: '=', value: newId }])).entities;
    } while (exist.length);

    const token = await this.signup({ id: newId, password: type, ...userInfo });
    if (!token) throw new Error('Fail create user');

    const user: any = await verify(token);
    const updated = await this.updateUserInfo(user._id, userInfo);

    return UserDatabase.createJwtToken({ ...updated }, type);
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

  async loginOAuthByPk(type: OAuth, id: string): Promise<string> {
    const user = await this.getUserInfoByPk(id);
    if (!user) throw new Error('Not found user');

    return UserDatabase.createJwtToken(user, type);
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

  async checkValidUpdateEmail(oldEmail: string, newEmail: string): Promise<boolean> {
    if (newEmail && newEmail !== oldEmail) {
      // Check exist user email
      const { entities: existEmail } = await this.find([{ key: 'email', op: '=', value: newEmail }]);
      if (existEmail.length) throw new Error('Exist user email');

      // Check valid email
      if (newEmail && !UserUtils.checkValidEmail(newEmail)) throw new Error('Invalid email');
    }

    return true;
  }

  async getUserInfoByPk(_id: string): Promise<UserTable> {
    if (!_id) throw new Error('Required id');

    const userinfo = await this.read(_id);
    if (!userinfo) throw new Error('User not found');

    updateCacheItem(userinfo.id, userinfo, getUserCacheKey);

    return userinfo;
  }

  async getUserInfoById(id): Promise<UserTable> {
    if (!id) throw new Error('Required id');

    const cacheItem = await getCacheItem<UserTable>(id, getUserCacheKey);
    if (cacheItem) return cacheItem;

    const { entities: existUser } = await this.find([{ key: 'id', op: '=', value: id }]);
    if (!existUser.length) throw new Error('User not found');

    updateCacheItem(existUser[0].id, existUser[0], getUserCacheKey);

    return existUser[0] || { id: undefined, email: undefined, username: undefined, password: undefined };
  }

  async updateUserInfo(id, { username, email, github, linkedin, description }: UserTable): Promise<UserTable> {
    checkEmptyItems({ id });

    // Empty check
    checkAllUndefinedValue({ username, email, github, linkedin, description });
    if (username === '') throw new Error('Username must be required');

    // Get old user information
    const userInfo = await this.getUserInfoByPk(id);

    // Same data as before
    if (!UserUtils.isChangeUserDataWithBefore({ username, email, github, linkedin, description }, userInfo)) throw new Error('No information to update');
    await this.checkValidUpdateEmail(userInfo.email, email);

    // Update user information
    const updateData = updateNewDataWithoutUndefined(userInfo, { username, email, github, linkedin, description: description && description.trim() });

    const updateInfo = await this.update(id, updateData);
    if (!updateInfo) throw new Error('Fail user data update');

    updateCacheItem(updateInfo.id, updateInfo, getUserCacheKey);

    return updateInfo;
  }
}

export default new UserDatabase();
