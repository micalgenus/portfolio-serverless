import '@/tests/config';

import chai from 'chai';
import express from 'express';

import graphql from '@/controllers/graphql';

type Response = any;
type methods = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface chaiRequest {
  params?: any;
  body?: any;
  authorization?: string;
}

const app = express();
app.use('/graphql', graphql);

/**
 * @param method HTTP Methods (GET, POST, DELETE, PUT)
 * @param path
 */
export const requestAsync = async (method: methods, path: string, { authorization, body, params }: chaiRequest) => {
  return new Promise<Response>((resolve, reject) => {
    return chai
      .request(app)
      [method.toLowerCase()](path)
      .query(params || {})
      .set('authorization', authorization || '')
      .send(body || {})
      .end((err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

interface graphQLRequest {
  query: any;
  variables?: any;
  authorization?: string;
}

export const graphQLAsync = ({ query, variables, authorization }: graphQLRequest) =>
  requestAsync('POST', '/graphql', { authorization, body: { query, variables } });

