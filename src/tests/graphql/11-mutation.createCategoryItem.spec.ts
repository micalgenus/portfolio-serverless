import { assert } from 'chai';

import { requestAsync, expect, gql } from './config';
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
    const res = await requestAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const result = await requestAsync({ query: createCategoryQuery, authorization: token });
    category = result.body.data.createCategory;
  });

  it('Success', async () => {
    const res = await requestAsync({ query, variables: { category }, authorization: token });
    expect(res).to.have.status(200);

    assert.equal(res.body.data.createCategoryItem.length > 0, true);
  });

  it('Invalid category', async () => {
    const res = await requestAsync({ query, variables: { category: '' }, authorization: token });
    expect(res).to.have.status(200);

    expect(res.body.data).to.be.null;
    assert.equal(res.body.errors[0].message, 'Category not found');
  });
});
