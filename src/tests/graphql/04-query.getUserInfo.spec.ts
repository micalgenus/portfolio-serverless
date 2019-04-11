import { assert } from 'chai';

import { requestAsync, expect, gql } from './config';

import './03-query.me.spec';

const query = gql`
  query getUserInfo($id: String!) {
    getUserInfo(id: $id) {
      id
      username
      email
      github
      linkedin
      description
    }
  }
`;

describe('Query getUserInfo', () => {
  it('Success', async () => {
    const res = await requestAsync({ query, variables: { id: 'user' } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo, { id: 'user', username: 'user', email: 'user@gmail.com', github: null, linkedin: null, description: null });
  });

  describe('Invalid', () => {
    it('Get not exist user info', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist' } });
      expect(res).to.have.status(200);

      expect(res.body.data.getUserInfo).to.be.null;
      assert.equal(res.body.errors[0].message, 'User not found');
    });

    it('Get not exist user info', async () => {
      const res = await requestAsync({ query, variables: { id: '' } });
      expect(res).to.have.status(200);

      expect(res.body.data.getUserInfo).to.be.null;
      assert.equal(res.body.errors[0].message, 'Required id');
    });
  });
});
