import UserModel from '@/models/User';
import CategoryModel from '@/models/Category';
import CategoryItemModel from '@/models/CategoryItem';

module.exports = {
  // Handle user signup
  signup: async (_, { id, username, email, password }) => UserModel.signup({ id, username, email, password }),

  // Handles user login
  login: async (_, { user, id, email, password }) => {
    if (user) return UserModel.login({ user, password });
    if (id) return UserModel.loginById({ id, password });
    if (email) return UserModel.loginByEmail({ email, password });
    throw new Error('user, id or email is required');
  },

  updateUserInfo: async (_, { username, email, github, linkedin, description }, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return UserModel.updateUserInfo(user._id, { username, email, github, linkedin, description });
  },

  createCategory: async (_, __, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return CategoryModel.createNewCategory(user.id);
  },

  updateCategory: async (_, { id, category }, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return CategoryModel.updateCategory(id, user.id, category);
  },

  updateCategorySequence: async (_, { sequences }, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return CategoryModel.updateCategorySequence(user.id, sequences);
  },

  removeCategory: async (_, { id }, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return CategoryModel.removeCategoryById(id, user.id);
  },

  createCategoryItem: async (_, { category }, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return CategoryItemModel.createItemForCategory(category, user.id);
  },

  removeCategoryItem: async (_, { id, category }, { user }) => {
    if (!user) throw new Error('You are not authenticated!');
    return CategoryItemModel.removeCategoryItemById(id, category, user.id);
  },
};
