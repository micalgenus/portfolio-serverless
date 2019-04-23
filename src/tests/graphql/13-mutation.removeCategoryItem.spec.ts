import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './12-category.items.spec';

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
  mutation removeCategoryItem($id: String!, $category: String!) {
    removeCategoryItem(id: $id, category: $category)
  }
`;

describe('Mutation removeCategoryItem', () => {
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
    const res = await graphQLAsync({ query, variables: { id: item, category }, authorization: token });
    expect(res).to.have.status(200);

    assert.equal(res.body.data.removeCategoryItem, true);
  });

  it('Not exist item', async () => {
    const res = await graphQLAsync({ query, variables: { id: item, category }, authorization: token });
    expect(res).to.have.status(200);

    expect(res.body.data).to.be.null;
    assert.equal(res.body.errors[0].message, 'Category item not found');
  });
});
