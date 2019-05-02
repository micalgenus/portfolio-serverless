// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export default gql`
  type Mutation {
    signup(id: String!, username: String!, email: String!, password: String!): String
    login(user: String, id: String, email: String, password: String!): String
    rememberMe(user: String, id: String, email: String, password: String!): String
    rememberMeLogin(token: String!): String
    updateUserInfo(username: String, email: String, github: String, linkedin: String, description: String): User
    changeUserId(id: String): User
    createCategory: String!
    updateCategory(id: String!, category: CategoryInput!): Category
    updateCategorySequence(sequences: [SequenceInput]!): Boolean!
    removeCategory(id: String!): Boolean!
    createCategoryItem(category: String!): String!
    removeCategoryItem(id: String!, category: String!): Boolean!
    updateCategoryItem(id: String!, category: String!, item: CategoryItemInput!): CategoryItem
    updateCategoryItemSequence(category: String!, sequences: [SequenceInput]!): Boolean!
  }
`;
