import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './05-mutation.updateUserInfo.spec';

const query = gql`
  mutation {
    createCategory
  }
`;

describe('Mutation createCategory', () => {
  let token = null;

  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;
  });

  it('Success', async () => {
    const res = await graphQLAsync({ query, authorization: token });
    expect(res).to.have.status(200);

    assert.equal(res.body.data.createCategory.length > 0, true);
  });

  it('Empty authorization', async () => {
    const res = await graphQLAsync({ query });
    expect(res).to.have.status(200);

    expect(res.body.data).to.be.null;
    assert.equal(res.body.errors[0].message, 'You are not authenticated!');
  });
});
