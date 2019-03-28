import { assert } from 'chai';
import { verify } from '@/controllers/auth';

const Mutation = require('./Mutation');

describe('GraphQL Mutation', function() {
  before(async () => {
    await Mutation.signup(null, { id: 'tester', username: 'tester', email: 'tester@gmail.com', password: 'test1234' });
  });

  describe('signup', function() {
    it('success', async function() {
      const token = await Mutation.signup(null, { id: 'signup', username: 'signup', email: 'signup@gmail.com', password: 'signup1234' });
      const { _id, iat, exp, ...user } = await verify(token);
      assert.deepEqual(user, { id: 'signup', username: 'signup', email: 'signup@gmail.com' });
    });

    it('already id', async function() {
      const message = await Mutation.signup(null, { id: 'tester', username: '1', email: '1@gmail.com', password: '1' }).catch(err => err.message);
      assert.equal(message, 'Exist user id');
    });

    it('already email', async function() {
      const message = await Mutation.signup(null, { id: '1', username: '1', email: 'tester@gmail.com', password: '1' }).catch(err => err.message);
      assert.equal(message, 'Exist user email');
    });

    it('empty id', async function() {
      const message = await Mutation.signup(null, { username: '1', email: '1@gmail.com', password: '1' }).catch(err => err.message);
      assert.equal(message, 'Invalid id');
    });

    it('empty username', async function() {
      const message = await Mutation.signup(null, { id: '1', email: '1@gmail.com', password: '1' }).catch(err => err.message);
      assert.equal(message, 'Invalid username');
    });

    it('empty password', async function() {
      const message = await Mutation.signup(null, { id: 'tester', username: '1', email: '1@gmail.com' }).catch(err => err.message);
      assert.equal(message, 'Invalid password');
    });

    it('empty email', async function() {
      const message = await Mutation.signup(null, { id: 'tester', username: '1', password: '1' }).catch(err => err.message);
      assert.equal(message, 'Invalid email');
    });

    it('Invalid email', async function() {
      const message = await Mutation.signup(null, { id: '1', username: '1', email: 'test', password: '1' }).catch(err => err.message);
      assert.equal(message, 'Invalid email');
    });
  });
});
