import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './10-mutation.updateCategorySequence.spec';

const createCategoryQuery = gql`
  mutation {
    createCategory
  }
`;

const query = gql`
  mutation createCategoryItem($category: String!) {
    createCategoryItem(category: $category)
  }
`;

describe('Mutation createCategoryItem', () => {
  let token = null;
  let category = null;

  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const result = await graphQLAsync({ query: createCategoryQuery, authorization: token });
    category = result.body.data.createCategory;
  });

  it('Success', async () => {
    const res = await graphQLAsync({ query, variables: { category }, authorization: token });
    expect(res).to.have.status(200);

    assert.equal(res.body.data.createCategoryItem.length > 0, true);
  });

  it('Invalid category', async () => {
    const res = await graphQLAsync({ query, variables: { category: '' }, authorization: token });
    expect(res).to.have.status(200);

    expect(res.body.data).to.be.null;
    assert.equal(res.body.errors[0].message, 'Category not found');
  });
});
