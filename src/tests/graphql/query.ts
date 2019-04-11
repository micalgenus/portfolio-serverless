import { gql } from './config';

export const signupQuery = gql`
  mutation signup($id: String!, $username: String!, $email: String!, $password: String!) {
    signup(id: $id, username: $username, email: $email, password: $password)
  }
`;

export const loginQuery = gql`
  mutation login($user: String, $id: String, $email: String, $password: String!) {
    login(user: $user, id: $id, email: $email, password: $password)
  }
`;
