// const userController = require('@/controllers/user');

module.exports = {
  // async me(_, __, { user }) {
  //   if (!user) throw new Error('You are not authenticated!');
  //   const { _id, PASSWORD, createdAt, updatedAt, ...userInfo } = await userController.getUserInfoByPk(user._id);
  //   return userInfo;
  // },
  me: async (_, __, {}) => ({ _id: 0, id: 'id', username: 'username', email: 'email' }),
};
