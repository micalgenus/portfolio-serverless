import UserModel from '@/models/User';

module.exports = {
  // Handle user signup
  signup: async (_, { id, username, email, password }) => UserModel.signup({ id, username, email, password }),

  // Handles user login
  login: async (_, { user, id, email, password }) => {
    if (user) return UserModel.login({ user, password });
    if (id) return UserModel.loginById({ id, password });
    if (email) return UserModel.loginByEmail({ email, password });
    throw new Error('user, id or email is required.');
  },
};
