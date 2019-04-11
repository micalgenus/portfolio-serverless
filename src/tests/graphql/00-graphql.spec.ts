import { request } from './config';

describe('GraphQL', () => {
  it('GraphQL launch with type check', done => {
    request({ query: {} }, () => done());
  }).timeout(10000);
});
