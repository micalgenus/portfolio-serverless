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
    const res = await requestAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
    token = res.body.data.login;

    const result = await requestAsync({ query: createCategoryQuery, authorization: token });
    category = result.body.data.createCategory;

    const res1 = await requestAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });
    const res2 = await requestAsync({ query: createCategoryItemQuery, variables: { category }, authorization: token });

    item1 = res1.body.data.createCategoryItem;
    item2 = res2.body.data.createCategoryItem;
  });

  it('Success', async () => {
    const res = await requestAsync({
      query,
      variables: { category, sequences: [{ _id: item1, sequence: 1 }, { _id: item2, sequence: 2 }] },
      authorization: token,
    });
    expect(res).to.have.status(200);
    assert.equal(res.body.data.updateCategoryItemSequence, true);

    const result = await requestAsync({
      query: getCategoriesQuery,
      variables: { id: 'user', categoryFilter: [category], itemFilter: [item1, item2] },
      authorization: token,
    });
    expect(result).to.have.status(200);
    assert.deepEqual(result.body.data.getUserInfo.categories[0].items, [{ _id: item2 }, { _id: item1 }]);
  });
});
