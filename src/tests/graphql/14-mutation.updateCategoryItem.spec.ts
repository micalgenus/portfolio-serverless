import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
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
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const res1 = await graphQLAsync({ query: createCategoryQuery, authorization: token });
    category = res1.body.data.createCategory;

    const res2 = await graphQLAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });
    item = res2.body.data.createCategoryItem;
  });

  it('Success', async () => {
    const res = await graphQLAsync({ query, variables: { id: item, category, item: { name: 'categoryItem' } }, authorization: token });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.updateCategoryItem, { name: 'categoryItem', description: '' });
  });
});
