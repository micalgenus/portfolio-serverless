import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './07-user.categories.spec';

const createCategoryQuery = gql`
  mutation {
    createCategory
  }
`;

const query = gql`
  mutation removeCategory($id: String!) {
    removeCategory(id: $id)
  }
`;

describe('Mutation removeCategory', () => {
  let token = null;
  let category1 = null;
  let category2 = null;

  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const res1 = await graphQLAsync({ query: createCategoryQuery, authorization: token });
    const res2 = await graphQLAsync({ query: createCategoryQuery, authorization: token });

    category1 = res1.body.data.createCategory;
    category2 = res2.body.data.createCategory;
  });

  describe('Success', () => {
    it('Remove category', async () => {
      const res = await graphQLAsync({ query, variables: { id: category1 }, authorization: token });
      expect(res).to.have.status(200);

      assert.equal(res.body.data.removeCategory, true);
    });
  });

  describe('Invalid', () => {
    it('Not exist', async () => {
      const res = await graphQLAsync({ query, variables: { id: category1 }, authorization: token });
      expect(res).to.have.status(200);

      expect(res.body.data).to.be.null;
      assert.equal(res.body.errors[0].message, 'Category not found');
    });

    it('Permission deined', async () => {
      const res = await graphQLAsync({ query, variables: { id: category2 } });
      expect(res).to.have.status(200);

      expect(res.body.data).to.be.null;
      assert.equal(res.body.errors[0].message, 'You are not authenticated!');
    });
  });
});
