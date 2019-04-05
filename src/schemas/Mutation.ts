// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export default gql`
  type Mutation {
    signup(id: String!, username: String!, email: String!, password: String!): String
    login(user: String, id: String, email: String, password: String!): String
    updateUserInfo(username: String, email: String, github: String, linkedin: String, description: String): User
    createCategory: String!
    updateCategory(id: String!, category: CategoryInput!): Category
    updateCategorySequence(sequences: [CategorySequenceInput]!): Boolean!
    removeCategory(id: String!): Boolean!
  }
`;
