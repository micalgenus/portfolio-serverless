import { assert } from 'chai';

import { requestAsync, expect, gql } from './config';
import { loginQuery } from './query';

import './02-mutation.login.spec';

const query = gql`
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

describe('Query me', () => {
  let token = null;

  before(async () => {
    const res = await requestAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;
  });

  it('Success', async () => {
    const res = await requestAsync({ query, authorization: token });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.me, { id: 'user', username: 'user', email: 'user@gmail.com', github: null, linkedin: null, description: null });
  });

  describe('Invalid', () => {
    it('Empty authorization token', async () => {
      const res = await requestAsync({ query });
      expect(res).to.have.status(200);

      expect(res.body.data.me).to.be.null;
      assert.equal(res.body.errors[0].message, 'You are not authenticated!');
    });
  });
});
