import CategoryItemModel from '@/models/CategoryItem';

module.exports = {
  _id: async ({ _id }) => _id,
  user: async ({ user }) => user,
  name: async ({ name }) => name,
  items: async ({ _id, user }, { filter }) => CategoryItemModel.getItemsByCategory(_id, user, filter),
};
