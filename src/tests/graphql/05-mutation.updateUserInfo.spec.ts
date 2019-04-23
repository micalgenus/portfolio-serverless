import { assert } from 'chai';

import { expect, gql } from '@/tests/config';
import { graphQLAsync } from '@/tests/http';
import { loginQuery, signupQuery } from './query';

import './04-query.getUserInfo.spec';

const query = gql`
  mutation updateUserInfo($username: String, $email: String, $github: String, $linkedin: String, $description: String) {
    updateUserInfo(username: $username, email: $email, github: $github, linkedin: $linkedin, description: $description) {
      id
      username
      email
      github
      linkedin
      description
    }
  }
`;

describe('Mutation updateUserInfo', () => {
  describe('Success', () => {
    let token = null;

    before(async () => {
      const res = await graphQLAsync({ query: loginQuery, variables: { id: 'user', password: 'user1234' } });
      token = res.body.data.login;
    });

    it('Success', async () => {
      const res = await graphQLAsync({ query, variables: { email: 'user2@gmail.com', description: 'description' }, authorization: token });
      expect(res).to.have.status(200);

      assert.deepEqual(res.body.data.updateUserInfo, {
        id: 'user',
        username: 'user',
        email: 'user2@gmail.com',
        github: '',
        linkedin: '',
        description: 'description',
      });
    });

    it('Update to empty value', async () => {
      const res = await graphQLAsync({ query, variables: { email: '', description: '' }, authorization: token });
      expect(res).to.have.status(200);

      assert.deepEqual(res.body.data.updateUserInfo, { id: 'user', username: 'user', email: '', github: '', linkedin: '', description: '' });
    });

    after(async () => {
      await graphQLAsync({ query, variables: { email: 'user@gmail.com', description: 'description' }, authorization: token });
    });
  });

  describe('Invalid', () => {
    let token = null;

    before(async () => {
      await graphQLAsync({ query: signupQuery, variables: { id: 'readonly', username: 'readonly', email: 'readonly@gmail.com', password: 'readonly1234' } });

      const res = await graphQLAsync({ query: loginQuery, variables: { id: 'readonly', password: 'readonly1234' } });
      token = res.body.data.login;
    });

    describe('Empty items', () => {
      it('User object', async () => {
        const res = await graphQLAsync({ query, variables: {} });
        expect(res).to.have.status(200);

        expect(res.body.data.updateUserInfo).to.be.null;
        assert.equal(res.body.errors[0].message, 'You are not authenticated!');
      });

      it('Information', async () => {
        const res = await graphQLAsync({ query, variables: {}, authorization: token });
        expect(res).to.have.status(200);

        expect(res.body.data.updateUserInfo).to.be.null;
        assert.equal(res.body.errors[0].message, 'No information to update');
      });

      it('username', async () => {
        const res = await graphQLAsync({ query, variables: { username: '' }, authorization: token });
        expect(res).to.have.status(200);

        expect(res.body.data.updateUserInfo).to.be.null;
        assert.equal(res.body.errors[0].message, 'Username must be required');
      });
    });

    it('Already exist email', async () => {
      const res = await graphQLAsync({ query, variables: { email: 'user@gmail.com' }, authorization: token });
      expect(res).to.have.status(200);

      expect(res.body.data.updateUserInfo).to.be.null;
      assert.equal(res.body.errors[0].message, 'Exist user email');
    });

    it('Same data as before', async () => {
      const res = await graphQLAsync({ query, variables: { username: 'readonly', email: 'readonly@gmail.com' }, authorization: token });
      expect(res).to.have.status(200);

      expect(res.body.data.updateUserInfo).to.be.null;
      assert.equal(res.body.errors[0].message, 'No information to update');
    });

    it('Invalid email format', async () => {
      const res = await graphQLAsync({ query, variables: { username: 'readonly', email: 'read@only@gmail.com' }, authorization: token });
      expect(res).to.have.status(200);

      expect(res.body.data.updateUserInfo).to.be.null;
      assert.equal(res.body.errors[0].message, 'Invalid email');
    });
  });
});
