import chai from 'chai';
import chaiHttp from 'chai-http';
import graphql from './graphql';

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
  }).timeout(10000);
});
