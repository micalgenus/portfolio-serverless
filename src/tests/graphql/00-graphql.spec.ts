import { requestAsync } from './config';

describe('GraphQL', () => {
  it('GraphQL launch with type check', async () => {
    await requestAsync({ query: {} });
  }).timeout(10000);
});
