import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';

import './15-mutation.updateCategoryItemSequence.spec';

const query = gql`
  mutation rememberMe($user: String, $id: String, $email: String, $password: String!) {
    rememberMe(user: $user, id: $id, email: $email, password: $password)
  }
`;

describe('Mutation rememberMe', () => {
  it('Create token for login', async () => {
    const res = await graphQLAsync({ query, variables: { user: 'user', password: 'user1234' } });
    expect(res).to.have.status(200);
    assert.isNotNull(res.body.data.rememberMe);
  });

  it('Not exist user', async () => {
    const res = await graphQLAsync({ query, variables: { user: 'notexist', password: 'notexist1234' } });
    expect(res).to.have.status(200);
    assert.isNull(res.body.data.rememberMe);
  });

  it('Not match password', async () => {
    const res = await graphQLAsync({ query, variables: { user: 'user', password: 'notexist1234' } });
    expect(res).to.have.status(200);
    assert.isNull(res.body.data.rememberMe);
  });
});
