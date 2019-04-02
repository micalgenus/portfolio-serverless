// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export default gql`
  type Mutation {
    """
    auth mutation
    """
    signup(id: String!, username: String!, email: String!, password: String!): String
    login(user: String, id: String, email: String, password: String!): String
    updateUserInfo(username: String, email: String, github: String, linkedin: String, description: String): User
    """
    Category mutation
    """
    createCategory: String!
    updateCategory(id: String!, category: CategoryInput!): Category
    removeCategory(id: String!): Boolean!
  }
`;
