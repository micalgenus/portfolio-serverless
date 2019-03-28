import UserModel from '@/models/User';

module.exports = {
  // Handle user signup
  signup: async (_, { id, username, email, password }) => UserModel.signup({ id, username, email, password }),

  // Handles user login
  // login: async (_, { user, id, email, password }) => {
  //   if (user) return authController.login({ user, password });
  //   if (id) return authController.loginById({ id, password });
  //   if (email) return authController.loginByEmail({ email, password });
  //   throw new Error('user, id or email is required.');
  // },
  login: async (_, {}) => 'login',
};
