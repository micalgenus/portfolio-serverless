import { assert } from 'chai';
import { verify } from '@/controllers/auth';

const Mutation = require('./Mutation');

describe('GraphQL Mutation', function() {
  before(async () => {
    await Mutation.signup(null, { id: 'tester', username: 'tester', email: 'tester@gmail.com', password: 'test1234' });
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
        assert.equal(message, 'user, id or email is required.');
      });

      it('password', async function() {
        const message = await Mutation.login(null, { id: 'tester' }).catch(err => err.message);
        assert.equal(message, 'A password is required.');
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
});
