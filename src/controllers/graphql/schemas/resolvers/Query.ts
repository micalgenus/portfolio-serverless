import UserModel from '@/models/User';

module.exports = {
  async me(_, __, { user }) {
    if (!user) throw new Error('You are not authenticated!');
    const { _id, password, ...userInfo } = await UserModel.getUserInfoByPk(user._id);
    return userInfo;
  },

  async getUserInfo(_, { id }) {
    const { _id, password, ...userInfo } = await UserModel.getUserInfoById(id);
    return userInfo;
  },
};
