import { assert } from 'chai';

import { requestAsync, expect, gql } from './config';
import { loginQuery } from './query';

import './05-mutation.updateUserInfo.spec';

const createCategoryQuery = gql`
  mutation {
    createCategory
  }
`;

const query = gql`
  query getUserInfo($id: String!, $filter: [String]) {
    getUserInfo(id: $id) {
      categories(filter: $filter) {
        user
        name
      }
    }
  }
`;

describe('User categories', () => {
  let token = null;

  before(async () => {
    const res = await requestAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;
  });

  it('Get user categories', async () => {
    const res = await requestAsync({ query, variables: { id: 'user' } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo.categories, [{ name: '', user: 'user' }]);
  });

  it('Empty categories', async () => {
    const res = await requestAsync({ query, variables: { id: 'readonly' } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo.categories, []);
  });

  it('Filtering categories', async () => {
    const res1 = await requestAsync({ query: createCategoryQuery, authorization: token });
    const res2 = await requestAsync({ query: createCategoryQuery, authorization: token });

    const category1 = res1.body.data.createCategory;
    const category2 = res2.body.data.createCategory;

    const res = await requestAsync({ query, variables: { id: 'user', filter: [category1, category2] } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo.categories, [{ name: '', user: 'user' }, { name: '', user: 'user' }]);
  });
});
