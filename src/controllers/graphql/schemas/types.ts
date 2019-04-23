// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

export const CategoryItem = gql`
  type CategoryItem {
    _id: String!
    name: String
    description: String
    # date: DateRange
    # link: [Link]
  }
`;

/**
 * @member user reference to user.id
 */
export const Category = gql`
  type Category {
    _id: String
    user: String
    name: String
    items(filter: [String]): [CategoryItem]
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
