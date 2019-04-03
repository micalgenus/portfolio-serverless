import chai, { assert } from 'chai';
import chaiHttp from 'chai-http';
import { AbortError, AggregateError } from 'redis';
import graphql, { redis } from './graphql';

import '@/schemas/resolvers/Mutation.spec';
import '@/schemas/resolvers/Query.spec';
import '@/schemas/resolvers/User.spec';
import '@/lib/utils/index.spec';

chai.use(chaiHttp);
chai.should();

describe('Serverless', function() {
  it('GraphQL launch with type check', done => {
    chai
      .request(graphql)
      .post('/')
      .end(() => done());
  });

  describe('Redis connection test', () => {
    before(() => {
      redis.end(true);
    });

    it('Close', () => {
      redis.on('error', function(err) {
        assert(err instanceof Error);
        assert(err instanceof AbortError);
        assert(err instanceof AggregateError);
        // The set and get get aggregated in here
        assert.strictEqual(err.errors.length, 2);
        assert.strictEqual(err.code, 'NR_CLOSED');
      });
    });
  });
});
