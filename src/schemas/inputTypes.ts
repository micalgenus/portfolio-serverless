// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export const CategoryInput = gql`
  input CategoryInput {
    name: String
    # items(items: [String]): [PortfolioItem]
  }
`;