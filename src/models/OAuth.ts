import DataStore from './index';

import UserModel from '@/models/User';

import { OAuthTable, OAuth } from '@/typings/database';

class OAuthDatabase extends DataStore<OAuthTable> {
  constructor() {
    super('oauth');
  }

  async getConnectedOAuth(type: OAuth, id: string) {
    const { entities: connect } = await this.find([{ key: 'id', op: '=', value: id }, { key: 'type', op: '=', value: type }]);
    return connect[0];
  }

  async connectToUser(type: OAuth, id: string, user: string): Promise<boolean> {
    // User exist check
    const existUser = await UserModel.getUserInfoByPk(user);
    if (!existUser) throw new Error('Not found user');

    // Duplication check
    const existConnect = await this.getConnectedOAuth(type, id);
    if (existConnect) throw new Error('Already connect account');

    // Connect to user
    const newConnect = await this.create({ type, id, user });
    if (!newConnect) throw new Error('Fail connect account');

    return true;
  }

  async getConnectOAuthUser(type: OAuth, id: string): Promise<string> {
    const connect = await this.getConnectedOAuth(type, id);
    if (!connect) return null;

    return connect.user.toString();
  }
}

export default new OAuthDatabase();
