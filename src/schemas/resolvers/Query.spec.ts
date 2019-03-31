import { assert } from 'chai';
import { verify } from '@/controllers/auth';

const Query = require('./Query');
const Mutation = require('./Mutation');

/* Requirement test */
require('./Mutation.spec');

describe('GraphQL Query', function() {
  let token = null;
  let user = null;

  before(async () => {
    token = await Mutation.login(null, { user: 'me', password: 'test1234' });
    user = await verify(token);
  });

  describe('me', function() {
    describe('Success', function() {
      it('Get user info', async function() {
        const userInfo = await Query.me(null, null, { user });
        assert.deepEqual(userInfo, { email: 'me@gmail.com', id: 'me', username: 'me' });
      });
    });

    describe('Invalid', function() {
      it('Get not exist user info', async function() {
        const message = await Query.me(null, null, { user: { _id: -1 } }).catch(err => err.message);
        assert.equal(message, 'User not found');
      });

      it('User object is empty', async function() {
        const message = await Query.me(null, null, { user: undefined }).catch(err => err.message);
        assert.equal(message, 'You are not authenticated!');
      });

      it('Primary key is empty in user', async function() {
        const message = await Query.me(null, null, { user: {} }).catch(err => err.message);
        assert.equal(message, 'Required id');
      });
    });
  });
});
