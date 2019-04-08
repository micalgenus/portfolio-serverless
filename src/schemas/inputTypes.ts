// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export const CategoryInput = gql`
  input CategoryInput {
    name: String
  }
`;

export const CategoryItemInput = gql`
  input CategoryItemInput {
    name: String
    description: String
  }
`;

export const SequenceInput = gql`
  input SequenceInput {
    _id: String!
    sequence: Int!
  }
`;
