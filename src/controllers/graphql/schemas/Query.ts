// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export default gql`
  type Query {
    me: User
    getUserInfo(id: String!): User
  }
`;
