// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export const User = gql`
  type User {
    id: String
    username: String
    email: String
    github: String
    linkedin: String
    description: String
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
    signup(id: String!, username: String!, email: String!, password: String!): String
    """
    login argument user = (id or email)
    """
    login(user: String, id: String, email: String, password: String!): String
    updateUserInfo(username: String, email: String, github: String, linkedin: String, description: String): User
  }
`;
