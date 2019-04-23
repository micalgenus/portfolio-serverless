import { graphQLAsync } from '@/tests/http';

describe('GraphQL', () => {
  it('GraphQL launch with type check', async () => {
    await graphQLAsync({ query: {} });
  }).timeout(10000);
});
