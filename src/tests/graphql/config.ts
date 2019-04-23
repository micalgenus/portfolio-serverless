import '../config';
import chai from 'chai';
import chaiHttp from 'chai-http';
import graphql from '@/controllers/graphql';

chai.use(chaiHttp);
chai.should();

type Response = any;

interface chaiRequest {
  query: any;
  variables?: any;
  authorization?: string;
}

export const expect = chai.expect;
export const gql = (query: TemplateStringsArray) => query.join('');

export const requestAsync = ({ query, variables, authorization }: chaiRequest) => {
  return new Promise<Response>((resolve, reject) => {
    chai
      .request(graphql)
      .post('/')
      .set('authorization', authorization || '')
      .send({ query, variables })
      .end((err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
  });
};
