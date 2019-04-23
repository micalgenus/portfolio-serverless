import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './08-mutation.removeCategory.spec';

const createCategoryQuery = gql`
  mutation {
    createCategory
  }
`;

const query = gql`
  mutation updateCategory($id: String!, $category: CategoryInput!) {
    updateCategory(id: $id, category: $category) {
      user
      name
    }
  }
`;

describe('Mutation updateCategory', () => {
  let token = null;
  let category = null;

  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const result = await graphQLAsync({ query: createCategoryQuery, authorization: token });
    category = result.body.data.createCategory;
  });

  it('Success', async () => {
    const res = await graphQLAsync({ query, variables: { id: category, category: { name: 'category' } }, authorization: token });
    expect(res).to.have.status(200);

    assert.deepEqual(res.body.data.updateCategory, { user: 'user', name: 'category' });
  });

  describe('Invalid', () => {
    it('Empty items', async () => {
      const res = await graphQLAsync({ query, variables: { id: category, category: {} }, authorization: token });
      expect(res).to.have.status(200);

      expect(res.body.data.updateCategory).to.be.null;
      assert.equal(res.body.errors[0].message, 'No information to update');
    });

    it('Permission deined', async () => {
      const res = await graphQLAsync({ query, variables: { id: category, category: { name: 'category' } } });
      expect(res).to.have.status(200);

      expect(res.body.data.updateCategory).to.be.null;
      assert.equal(res.body.errors[0].message, 'You are not authenticated!');
    });

    it('Not exist', async () => {
      const res = await graphQLAsync({ query, variables: { id: '-1', category: { name: 'category' } }, authorization: token });
      expect(res).to.have.status(200);

      expect(res.body.data.updateCategory).to.be.null;
      assert.equal(res.body.errors[0].message, 'Category not found');
    });
  });
});
