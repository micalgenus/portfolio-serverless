import { assert } from 'chai';
import { verify } from '@/controllers/auth/jwt';

import { requestAsync, expect, gql } from './config';

import './00-graphql.spec';

const query = gql`
  mutation signup($id: String!, $username: String!, $email: String!, $password: String!) {
    signup(id: $id, username: $username, email: $email, password: $password)
  }
`;

describe('Mutation signup', () => {
  it('Success', async () => {
    const res = await requestAsync({ query, variables: { id: 'user', username: 'user', email: 'user@gmail.com', password: 'user1234' } });
    expect(res).to.have.status(200);

    assert.isNotNull(res.body.data.signup);

    const { _id, iat, exp, ...user } = await verify(res.body.data.signup);
    assert.deepEqual(user, { id: 'user', username: 'user', email: 'user@gmail.com' });
  });

  describe('Already items', () => {
    it('id', async () => {
      const res = await requestAsync({ query, variables: { id: 'user', username: 'notexist', email: 'notexist@gmail.com', password: 'user1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Exist user id');
    });

    it('email', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist', username: 'notexist', email: 'user@gmail.com', password: 'user1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Exist user email');
    });
  });

  describe('Empty items', () => {
    it('id', async () => {
      const res = await requestAsync({ query, variables: { id: '', username: 'notexist', email: 'notexist@gmail.com', password: 'user1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Empty id');
    });

    it('username', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist', username: '', email: 'notexist@gmail.com', password: 'user1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Empty username');
    });

    it('email', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist', username: 'notexist', email: '', password: 'user1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Empty email');
    });

    it('password', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist', username: 'notexist', email: 'notexist@gmail.com', password: '' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Empty password');
    });
  });

  describe('Invalid items', () => {
    it('id', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist@email', username: 'notexist', email: 'notexist@gmail.com', password: 'notexist' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Invalid id');
    });

    it('email', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist', username: 'notexist', email: 'notexist', password: 'notexist' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Invalid email');
    });

    it('password', async () => {
      const res = await requestAsync({ query, variables: { id: 'notexist', username: 'notexist', email: 'notexist@gmail.com', password: 'user' } });
      expect(res).to.have.status(200);

      expect(res.body.data.signup).to.be.null;
      assert.equal(res.body.errors[0].message, 'Invalid password');
    });
  });
});
