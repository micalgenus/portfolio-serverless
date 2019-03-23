// const authController = require('@/controllers/auth');

module.exports = {
  // Handle user signup
  // signup: async (_, { id, username, email, password }) => authController.signup({ id, username, email, password }),
  signup: async (_, {}) => 'signup',

  // Handles user login
  // login: async (_, { user, id, email, password }) => {
  //   if (user) return authController.login({ user, password });
  //   if (id) return authController.loginById({ id, password });
  //   if (email) return authController.loginByEmail({ email, password });
  //   throw new Error('user, id or email is required.');
  // },
  login: async (_, {}) => 'login',
};
