export const User = `
  type User {
    id: String
    username: String
    email: String
    github: String
    linkedin: String
  }
`;

export const Query = `
  type Query {
    me: User
    getUserInfo (id: String!): User
  }
`;

export const Mutation = `
  type Mutation {
    signup (id: String!, username: String!, email: String!, password: String!): String
    """ login argument user = (id or email) """
    login (user: String, id: String, email: String, password: String!): String
    updateUserInfo (username: String, email: String, github: String, linkedin: String): User
  }
`;
