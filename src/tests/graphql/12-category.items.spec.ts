import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './11-mutation.createCategoryItem.spec';

const createCategoryItemQuery = gql`
  mutation createCategoryItem($category: String!) {
    createCategoryItem(category: $category)
  }
`;

const query = gql`
  query getUserInfo($id: String!, $categoryFilter: [String], $itemFilter: [String]) {
    getUserInfo(id: $id) {
      categories(filter: $categoryFilter) {
        _id
        items(filter: $itemFilter) {
          name
          description
        }
      }
    }
  }
`;

describe('Category items', () => {
  let token = null;
  let category = null;

  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const result = await graphQLAsync({ query, variables: { id: 'user' } });
    category = result.body.data.getUserInfo.categories[result.body.data.getUserInfo.categories.length - 1]._id;
  });

  it('Success', async () => {
    const res = await graphQLAsync({ query, variables: { id: 'user', categoryFilter: [category] } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo.categories[0].items, [{ name: '', description: '' }]);
  });

  it('Empty items', async () => {
    const res = await graphQLAsync({ query, variables: { id: 'user' } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo.categories[0].items, []);
  });

  it('Filtering categories', async () => {
    const res1 = await graphQLAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });
    const res2 = await graphQLAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });

    const item1 = res1.body.data.createCategoryItem;
    const item2 = res2.body.data.createCategoryItem;

    const res = await graphQLAsync({ query, variables: { id: 'user', categoryFilter: [category], itemFilter: [item1, item2] } });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.getUserInfo.categories[0].items, [{ name: '', description: '' }, { name: '', description: '' }]);
  });
});
