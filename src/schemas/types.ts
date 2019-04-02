// import gql from 'graphql-tag';
const gql = (query: TemplateStringsArray) => query.join('');

// export const Link = gql`
//   type Link {
//     _id: String!
//     icon: String
//     color: String
//     href: String
//   }
// `;

// export const DateRange = gql`
//   type DateRange {
//     start: Int
//     end: Int
//   }
// `;

// export const PortfolioItem = gql`
//   type PortfolioItem {
//     _id: String!
//     title: String
//     date: DateRange
//     description: String
//     content: String
//     link: [Link]
//   }
// `;
/**
 * @member user reference to user.id
 */
export const Category = gql`
  type Category {
    _id: String
    user: String
    name: String
    # items(items: [String]): [PortfolioItem]
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
