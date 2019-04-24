import '@/tests/config';

import chai from 'chai';
import express from 'express';

import oauth from '@/controllers/auth/oauth';
import graphql from '@/controllers/graphql';

import { OAuth } from '@/typings/database';

type Response = any;
type methods = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface chaiRequest {
  params?: any;
  body?: any;
  authorization?: string;
}

const app = express();
app.use('/oauth', oauth);
app.use('/graphql', graphql);

export default app;

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

type OAuthTest = 'github';

interface oauthRequest {
  type: OAuth | OAuthTest;
  code: string;
}

export const oauthAsync = ({ type, code }: oauthRequest) => requestAsync('GET', '/oauth', { params: { type, code } });
