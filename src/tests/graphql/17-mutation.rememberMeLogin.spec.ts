import { assert } from 'chai';

import { requestAsync, expect, gql } from './config';

import './16-mutation.rememberMe.spec';

const meQuery = gql`
  query {
    me {
      id
      username
      email
      github
      linkedin
      description
    }
  }
`;

const rememberMeQuery = gql`
  mutation rememberMe($user: String, $id: String, $email: String, $password: String!) {
    rememberMe(user: $user, id: $id, email: $email, password: $password)
  }
`;

const query = gql`
  mutation rememberMeLogin($token: String!) {
    rememberMeLogin(token: $token)
  }
`;

describe('Mutation rememberMe', () => {
  let token = null;
  before(async () => {
    const res = await requestAsync({ query: rememberMeQuery, variables: { user: 'user', password: 'user1234' } });
    token = res.body.data.rememberMe;
  });

  it('Create token for login', async () => {
    const res = await requestAsync({ query, variables: { token } });
    expect(res).to.have.status(200);
    assert.isNotNull(res.body.data.rememberMeLogin);

    const after = await requestAsync({ query: meQuery, authorization: res.body.data.rememberMeLogin });
    expect(after).to.have.status(200);
    assert.deepEqual(after.body.data.me, { description: 'description', email: 'user@gmail.com', github: '', id: 'user', linkedin: '', username: 'user' });
  });

  it('Empty token', async () => {
    const res = await requestAsync({ query, variables: { token: '' } });
    expect(res).to.have.status(200);

    expect(res.body.data.rememberMeLogin).to.be.null;
    assert.equal(res.body.errors[0].message, 'Required token');
  });

  it('Invalid token', async () => {
    const res = await requestAsync({ query, variables: { token: 'token' } });
    expect(res).to.have.status(200);

    expect(res.body.data.rememberMeLogin).to.be.null;
    assert.equal(res.body.errors[0].message, 'Invalid token');
  });
});
