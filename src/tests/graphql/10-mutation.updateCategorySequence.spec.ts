import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery } from './query';

import './09-mutation.updateCategory.spec';

const createCategoryQuery = gql`
  mutation {
    createCategory
  }
`;

const getCategoriesQuery = gql`
  query getUserInfo($id: String!, $filter: [String]) {
    getUserInfo(id: $id) {
      categories(filter: $filter) {
        _id
      }
    }
  }
`;

const query = gql`
  mutation updateCategorySequence($sequences: [SequenceInput]!) {
    updateCategorySequence(sequences: $sequences)
  }
`;

describe('Mutation updateCategorySequence', () => {
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

  it('Success', async () => {
    const res = await graphQLAsync({
      query,
      variables: { sequences: [{ _id: category1, sequence: 1 }, { _id: category2, sequence: 2 }] },
      authorization: token,
    });
    expect(res).to.have.status(200);
    assert.deepEqual(res.body.data.updateCategorySequence, true);

    const result = await graphQLAsync({
      query: getCategoriesQuery,
      variables: { id: 'user', filter: [category1, category2] },
      authorization: token,
    });
    expect(result).to.have.status(200);
    assert.deepEqual(result.body.data.getUserInfo.categories, [{ _id: category2 }, { _id: category1 }]);
  });
});
