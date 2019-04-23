import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './14-mutation.updateCategoryItem.spec';

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

const getCategoriesQuery = gql`
  query getUserInfo($id: String!, $categoryFilter: [String], $itemFilter: [String]) {
    getUserInfo(id: $id) {
      categories(filter: $categoryFilter) {
        items(filter: $itemFilter) {
          _id
        }
      }
    }
  }
`;

const query = gql`
  mutation updateCategoryItemSequence($category: String!, $sequences: [SequenceInput]!) {
    updateCategoryItemSequence(category: $category, sequences: $sequences)
  }
`;

describe('Mutation updateCategoryItemSequence', () => {
  let token = null;
  let category = null;
  let item1 = null;
  let item2 = null;

  before(async () => {
    const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const result = await graphQLAsync({ query: createCategoryQuery, authorization: token });
    category = result.body.data.createCategory;

    const res1 = await graphQLAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });
    const res2 = await graphQLAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });

    item1 = res1.body.data.createCategoryItem;
    item2 = res2.body.data.createCategoryItem;
  });

  it('Success', async () => {
    const before = await graphQLAsync({
      query: getCategoriesQuery,
      variables: { id: 'user', categoryFilter: [category], itemFilter: [item1, item2] },
      authorization: token,
    });
    expect(before).to.have.status(200);
    assert.deepEqual(before.body.data.getUserInfo.categories[0].items, [{ _id: item1 }, { _id: item2 }]);

    const res = await graphQLAsync({
      query,
      variables: { category, sequences: [{ _id: item1, sequence: 1 }, { _id: item2, sequence: 2 }] },
      authorization: token,
    });
    expect(res).to.have.status(200);
    assert.equal(res.body.data.updateCategoryItemSequence, true);

    const after = await graphQLAsync({
      query: getCategoriesQuery,
      variables: { id: 'user', categoryFilter: [category], itemFilter: [item1, item2] },
      authorization: token,
    });
    expect(after).to.have.status(200);
    assert.deepEqual(after.body.data.getUserInfo.categories[0].items, [{ _id: item2 }, { _id: item1 }]);
  });
});
