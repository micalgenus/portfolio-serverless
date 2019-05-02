import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';

import { loginQuery } from './query';

import './17-mutation.rememberMeLogin.spec';

const getQuery = gql`
  query getUserInfo($id: String!) {
    getUserInfo(id: $id) {
      id
    }
  }
`;

const query = gql`
  mutation changeUserId($id: String!) {
    changeUserId(id: $id) {
      id
    }
  }
`;

describe('Mutation changeUserId', () => {
  let token = null;
  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;
  });

  it('Success', async () => {
    const res = await graphQLAsync({ query, variables: { id: 'changedid' }, authorization: token });
    expect(res).to.have.status(200);
    assert.deepEqual(res.body.data.changeUserId, { id: 'changedid' });

    const before = await graphQLAsync({ query: getQuery, variables: { id: 'user' } });
    expect(before).to.have.status(200);
    assert.isNull(before.body.data.getUserInfo);
    assert.equal(before.body.errors[0].message, 'User not found');

    const after = await graphQLAsync({ query: getQuery, variables: { id: 'changedid' } });
    expect(after).to.have.status(200);
    assert.deepEqual(after.body.data.getUserInfo, { id: 'changedid' });
  });

  after(async () => {
    await graphQLAsync({ query, variables: { id: 'user' }, authorization: token });
  });
});
