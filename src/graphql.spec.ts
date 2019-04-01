import chai from 'chai';
import chaiHttp from 'chai-http';
import graphql from './graphql';

chai.use(chaiHttp);
chai.should();

it('GraphQL launch', done => {
  chai
    .request(graphql)
    .post('/')
    .end(() => done());
});
