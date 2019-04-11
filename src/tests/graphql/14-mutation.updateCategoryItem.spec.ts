import { assert } from 'chai';

import { requestAsync, expect, gql } from './config';
import { loginQuery } from './query';

import './13-mutation.removeCategoryItem.spec';

const createCategoryQuery = gql`
  mutation {
    createCategory
  }
`;

const createCategoryItemQuery = gql`
  mutation createCategoryItem($category: String!) {
    createCategoryItem(category: $category)
  }
`;

const query = gql`
  mutation updateCategoryItem($id: String!, $category: String!, $item: CategoryItemInput!) {
    updateCategoryItem(id: $id, category: $category, item: $item) {
      name
      description
    }
  }
`;

describe('Mutation updateCategoryItem', () => {
  let token = null;
  let category = null;
  let item = null;

  before(async () => {
    const res = await requestAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const res1 = await requestAsync({ query: createCategoryQuery, authorization: token });
    category = res1.body.data.createCategory;

    const res2 = await requestAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });
    item = res2.body.data.createCategoryItem;
  });

  it('Success', async () => {
    const res = await requestAsync({ query, variables: { id: item, category, item: { name: 'categoryItem' } }, authorization: token });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.updateCategoryItem, { name: 'categoryItem', description: '' });
  });
});
