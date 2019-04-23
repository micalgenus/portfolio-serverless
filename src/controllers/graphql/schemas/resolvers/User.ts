import CategoryModel from '@/models/Category';

module.exports = {
  id: async ({ id }) => id,
  username: async ({ username }) => username,
  email: async ({ email }) => email,
  github: async ({ github }) => github,
  linkedin: async ({ linkedin }) => linkedin,
  description: async ({ description }) => description,
  categories: async ({ id }, { filter }) => CategoryModel.getCategoryByUserId(id, filter),
};
