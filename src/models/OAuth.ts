import DataStore from './index';

import UserModel from '@/models/User';

import { OAuthTable, OAuth } from '@/typings/database';

class OAuthDatabase extends DataStore<OAuthTable> {
  constructor() {
    super('oauth');
  }

  async connectToUser(type: OAuth, id: string, user: string): Promise<boolean> {
    // User exist check
    const existUser = await UserModel.getUserInfoByPk(user);
    if (!existUser) throw new Error('Not found user');

    // Duplication check
    const { entities: existConnect } = await this.find([{ key: '_id', op: '=', value: id }, { key: 'type', op: '=', value: type }]);
    if (existConnect.length) throw new Error('Already connect account');

    // Connect to user
    const newConnect = await this.create({ type, id, user });
    if (!newConnect) throw new Error('Fail connect account');

    return true;
  }

  async getConnectOAuthUser(type: OAuth, id: string): Promise<string> {
    const { entities: connect } = await this.find([{ key: '_id', op: '=', value: id }, { key: 'type', op: '=', value: type }]);
    if (connect.length !== 1) return null;

    return connect[0].user.toString();
  }
}

export default new OAuthDatabase();
