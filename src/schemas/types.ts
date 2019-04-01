// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export const Category = gql`
  type Category {
    _id: String
    user: String
    name: String
  }
`;

export const User = gql`
  type User {
    id: String
    username: String
    email: String
    github: String
    linkedin: String
    description: String
    categories(filter: [String]): [Category]
  }
`;

export const Query = gql`
  type Query {
    me: User
    getUserInfo(id: String!): User
  }
`;

export const Mutation = gql`
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
  }
`;
