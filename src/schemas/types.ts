export const User = `
  type User {
    _id: Int
    id: String
    username: String
    email: String
  }
`;

export const Query = `
  type Query {
    me: User
  }
`;

export const Mutation = `
  type Mutation {
    signup (id: String!, username: String!, email: String!, password: String!): String
    """ login argument user = (id or email) """
    login (user: String, id: String, email: String, password: String!): String
  }
`;