// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export const CategoryInput = gql`
  input CategoryInput {
    name: String
    # items(items: [String]): [PortfolioItem]
  }
`;

export const CategorySequenceInput = gql`
  input CategorySequenceInput {
    _id: String!
    sequence: Int!
  }
`;
