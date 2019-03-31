import { assert } from 'chai';
import { verify } from '@/controllers/auth';

const Mutation = require('./Mutation');

describe('GraphQL Mutation', function() {
  before(async () => {
    await Mutation.signup(null, { id: 'tester', username: 'tester', email: 'tester@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'readonly', username: 'readonly', email: 'readonly@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'me', username: 'me', email: 'me@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'update', username: 'update', email: 'update@gmail.com', password: 'test1234' });
  });

  describe('signup', function() {
    it('Success', async function() {
      const token = await Mutation.signup(null, { id: 'signup', username: 'signup', email: 'signup@gmail.com', password: 'signup1234' });
      const { _id, iat, exp, ...user } = await verify(token);
      assert.deepEqual(user, { id: 'signup', username: 'signup', email: 'signup@gmail.com' });
    });

    describe('Already items', function() {
      it('id', async function() {
        const message = await Mutation.signup(null, { id: 'tester', username: 'notexist', email: 'notexist@gmail.com', password: 'notexist' }).catch(
          err => err.message
        );
        assert.equal(message, 'Exist user id');
      });

      it('email', async function() {
        const message = await Mutation.signup(null, { id: 'notexist', username: 'notexist', email: 'tester@gmail.com', password: 'notexist' }).catch(
          err => err.message
        );
        assert.equal(message, 'Exist user email');
      });
    });

    describe('Empty items', function() {
      it('id', async function() {
        const message = await Mutation.signup(null, { username: 'notexist', email: 'notexist@gmail.com', password: 'notexist' }).catch(err => err.message);
        assert.equal(message, 'Empty id');
      });

      it('username', async function() {
        const message = await Mutation.signup(null, { id: 'notexist', email: '1@gmail.com', password: 'notexist' }).catch(err => err.message);
        assert.equal(message, 'Empty username');
      });

      it('password', async function() {
        const message = await Mutation.signup(null, { id: 'tester', username: 'notexist', email: '1@gmail.com' }).catch(err => err.message);
        assert.equal(message, 'Empty password');
      });

      it('email', async function() {
        const message = await Mutation.signup(null, { id: 'tester', username: 'notexist', password: 'notexist' }).catch(err => err.message);
        assert.equal(message, 'Empty email');
      });
    });

    describe('Invalid items', function() {
      it('id', async function() {
        const message = await Mutation.signup(null, { id: 'test@id', username: 'notexist', email: 'notexist@gmail.com', password: 'notexist' }).catch(
          err => err.message
        );
        assert.equal(message, 'Invalid id');
      });

      it('email', async function() {
        const message = await Mutation.signup(null, { id: 'notexist', username: 'notexist', email: 'test', password: 'notexist' }).catch(err => err.message);
        assert.equal(message, 'Invalid email');
      });

      it('password', async function() {
        const message = await Mutation.signup(null, { id: 'notexist', username: 'notexist', email: 'notexist@gmail.com', password: '1234' }).catch(
          err => err.message
        );
        assert.equal(message, 'Invalid password');
      });
    });
  });

  describe('login', function() {
    describe('Invalid items', function() {
      it('id', async function() {
        const message = await Mutation.login(null, { id: 'invalid', password: 'test1234' }).catch(err => err.message);
        assert.equal(message, 'No user with that id');
      });

      it('Invalid email format', async function() {
        const message = await Mutation.login(null, { email: 'invalid', password: 'test1234' }).catch(err => err.message);
        assert.equal(message, 'Invalid email');
      });

      it('Not exist email', async function() {
        const message = await Mutation.login(null, { email: 'invalid@invalid.com', password: '1234' }).catch(err => err.message);
        assert.equal(message, 'No user with that email');
      });

      it('password', async function() {
        const message = await Mutation.login(null, { id: 'tester', password: 'invalid' }).catch(err => err.message);
        assert.equal(message, 'Incorrect password');
      });
    });

    describe('Empty items', function() {
      it('Arguments', async function() {
        const message = await Mutation.login(null, { password: 'test1234' }).catch(err => err.message);
        assert.equal(message, 'user, id or email is required');
      });

      it('password', async function() {
        const message = await Mutation.login(null, { id: 'tester' }).catch(err => err.message);
        assert.equal(message, 'A password is required');
      });
    });

    describe('Success', function() {
      it('user(id)', async function() {
        const token = await Mutation.login(null, { user: 'tester', password: 'test1234' });
        const { _id, iat, exp, ...user } = await verify(token);
        assert.deepEqual(user, { id: 'tester', username: 'tester', email: 'tester@gmail.com' });
      });

      it('user(email)', async function() {
        const token = await Mutation.login(null, { user: 'tester@gmail.com', password: 'test1234' });
        const { _id, iat, exp, ...user } = await verify(token);
        assert.deepEqual(user, { id: 'tester', username: 'tester', email: 'tester@gmail.com' });
      });

      it('id', async function() {
        const token = await Mutation.login(null, { id: 'tester', password: 'test1234' });
        const { _id, iat, exp, ...user } = await verify(token);
        assert.deepEqual(user, { id: 'tester', username: 'tester', email: 'tester@gmail.com' });
      });

      it('email', async function() {
        const token = await Mutation.login(null, { email: 'tester@gmail.com', password: 'test1234' });
        const { _id, iat, exp, ...user } = await verify(token);
        assert.deepEqual(user, { id: 'tester', username: 'tester', email: 'tester@gmail.com' });
      });
    });
  });

  describe('updateUserInfo', function() {
    describe('Success', function() {
      let token = null;
      let user = null;

      before(async () => {
        token = await Mutation.login(null, { user: 'update', password: 'test1234' });
        user = await verify(token);
      });

      it('Update', async function() {
        const { id, email, username, description, ...rest } = await Mutation.updateUserInfo(
          null,
          { email: 'updated@gmail.com', description: 'description' },
          { user: user }
        ).catch(err => err.message);
        assert.deepEqual({ id, email, username, description }, { id: 'update', email: 'updated@gmail.com', username: 'update', description: 'description' });
      });

      it('Update to empty value', async function() {
        const { id, email, username, description, ...rest } = await Mutation.updateUserInfo(null, { email: '', description: '' }, { user: user }).catch(
          err => err.message
        );
        assert.deepEqual({ id, email, username, description }, { id: 'update', email: '', username: 'update', description: '' });
      });
    });

    describe('Invalid', function() {
      let token = null;
      let user = null;

      before(async () => {
        token = await Mutation.login(null, { user: 'readonly', password: 'test1234' });
        user = await verify(token);
      });
      describe('Empty items', function() {
        it('User object', async function() {
          const message = await Mutation.updateUserInfo(null, {}, { user: undefined }).catch(err => err.message);
          assert.equal(message, 'You are not authenticated!');
        });

        it('Information', async function() {
          const message = await Mutation.updateUserInfo(null, {}, { user }).catch(err => err.message);
          assert.equal(message, 'No information to update');
        });

        it('username', async function() {
          const message = await Mutation.updateUserInfo(null, { username: '' }, { user }).catch(err => err.message);
          assert.equal(message, 'Username must be required');
        });

        it('Primary key', async function() {
          const message = await Mutation.updateUserInfo(null, {}, { user: {} }).catch(err => err.message);
          assert.equal(message, 'Required id');
        });
      });

      it('Get not exist user info', async function() {
        const message = await Mutation.updateUserInfo(null, { username: 'readonly' }, { user: { _id: -1 } }).catch(err => err.message);
        assert.equal(message, 'User not found');
      });

      it('Already exist email', async function() {
        const message = await Mutation.updateUserInfo(null, { email: 'me@gmail.com' }, { user }).catch(err => err.message);
        assert.equal(message, 'Exist user email');
      });

      it('Same data as before', async function() {
        const message = await Mutation.updateUserInfo(null, { username: 'readonly', email: 'readonly@gmail.com' }, { user }).catch(err => err.message);
        assert.equal(message, 'No information to update');
      });

      it('Invalid email', async function() {
        const message = await Mutation.updateUserInfo(null, { username: 'readonly', email: 'read@only@gmail.com' }, { user }).catch(err => err.message);
        assert.equal(message, 'Invalid email');
      });
    });
  });
});
