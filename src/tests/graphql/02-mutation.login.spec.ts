import { assert } from 'chai';
import { verify } from '@/controllers/auth/jwt';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';

import './01-mutation.singup.spec';

const query = gql`
  mutation login($user: String, $id: String, $email: String, $password: String!) {
    login(user: $user, id: $id, email: $email, password: $password)
  }
`;

describe('Mutation login', () => {
  describe('Success', () => {
    it('user(id)', async () => {
      const res = await graphQLAsync({ query, variables: { user: 'user', password: 'user1234' } });
      expect(res).to.have.status(200);

      const { _id, iat, exp, ...user } = await verify(res.body.data.login);
      assert.deepEqual(user, { id: 'user', username: 'user', email: 'user@gmail.com', type: 'LOCAL' });
    });

    it('user(email)', async () => {
      const res = await graphQLAsync({ query, variables: { user: 'user@gmail.com', password: 'user1234' } });
      expect(res).to.have.status(200);

      const { _id, iat, exp, ...user } = await verify(res.body.data.login);
      assert.deepEqual(user, { id: 'user', username: 'user', email: 'user@gmail.com', type: 'LOCAL' });
    });

    it('id', async () => {
      const res = await graphQLAsync({ query, variables: { id: 'user', password: 'user1234' } });
      expect(res).to.have.status(200);

      const { _id, iat, exp, ...user } = await verify(res.body.data.login);
      assert.deepEqual(user, { id: 'user', username: 'user', email: 'user@gmail.com', type: 'LOCAL' });
    });

    it('email', async () => {
      const res = await graphQLAsync({ query, variables: { email: 'user@gmail.com', password: 'user1234' } });
      expect(res).to.have.status(200);

      const { _id, iat, exp, ...user } = await verify(res.body.data.login);
      assert.deepEqual(user, { id: 'user', username: 'user', email: 'user@gmail.com', type: 'LOCAL' });
    });
  });

  describe('Invalid items', () => {
    it('id', async () => {
      const res = await graphQLAsync({ query, variables: { id: 'invalid', password: 'invalid1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.login).to.be.null;
      assert.equal(res.body.errors[0].message, 'No user with that id');
    });

    it('Invalid email format', async () => {
      const res = await graphQLAsync({ query, variables: { email: 'invalid', password: 'invalid1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.login).to.be.null;
      assert.equal(res.body.errors[0].message, 'Invalid email');
    });

    it('Not exist email', async () => {
      const res = await graphQLAsync({ query, variables: { email: 'invalid@invalid.com', password: 'invalid1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.login).to.be.null;
      assert.equal(res.body.errors[0].message, 'No user with that email');
    });

    it('password', async () => {
      const res = await graphQLAsync({ query, variables: { id: 'user', password: 'invalid1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.login).to.be.null;
      assert.equal(res.body.errors[0].message, 'Incorrect password');
    });
  });

  describe('Empty items', () => {
    it('Arguments', async () => {
      const res = await graphQLAsync({ query, variables: { user: '', password: 'invalid1234' } });
      expect(res).to.have.status(200);

      expect(res.body.data.login).to.be.null;
      assert.equal(res.body.errors[0].message, 'user, id or email is required');
    });

    it('password', async () => {
      const res = await graphQLAsync({ query, variables: { id: 'user', password: '' } });
      expect(res).to.have.status(200);

      expect(res.body.data.login).to.be.null;
      assert.equal(res.body.errors[0].message, 'A password is required');
    });
  });
});
