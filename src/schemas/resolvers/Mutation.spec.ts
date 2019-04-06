import { assert } from 'chai';
import { verify } from '@/controllers/auth';

const Mutation = require('./Mutation');
const User = require('./User');

describe('GraphQL Mutation', function() {
  before(async () => {
    await Mutation.signup(null, { id: 'tester', username: 'tester', email: 'tester@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'readonly', username: 'readonly', email: 'readonly@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'me', username: 'me', email: 'me@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'update', username: 'update', email: 'update@gmail.com', password: 'test1234' });
    await Mutation.signup(null, { id: 'category', username: 'category', email: 'category@gmail.com', password: 'test1234' });
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

  describe('createCategory', function() {
    describe('Success', function() {
      let token = null;
      let user = null;

      before(async () => {
        token = await Mutation.login(null, { user: 'tester', password: 'test1234' });
        user = await verify(token);
      });

      it('Create category', async function() {
        const id = await Mutation.createCategory(null, null, { user });
        assert.equal(!!id, true);
      });
    });

    describe('Invalid', function() {
      it('Token not exist', async function() {
        const message = await Mutation.createCategory(null, null, {}).catch(err => err.message);
        assert.equal(message, 'You are not authenticated!');
      });

      it('Invalid user', async function() {
        const message = await Mutation.createCategory(null, null, { user: { id: 'notexist' } }).catch(err => err.message);
        assert.equal(message, 'User not found');
      });
    });
  });

  describe('updateCategory', function() {
    let token = null;
    let user = null;
    let category1 = null;
    let category2 = null;

    before(async () => {
      token = await Mutation.login(null, { user: 'category', password: 'test1234' });
      user = await verify(token);
      category1 = await Mutation.createCategory(null, null, { user });
      category2 = await Mutation.createCategory(null, null, { user });
    });

    describe('Success', function() {
      it('Update category', async function() {
        const { name } = await Mutation.updateCategory(null, { id: category1, category: { name: 'category' } }, { user });
        assert.deepEqual({ name }, { name: 'category' });
      });
    });

    describe('Invalid', function() {
      it('Empty items', async function() {
        const message = await Mutation.updateCategory(null, { id: category2, category: {} }, { user }).catch(err => err.message);
        assert.equal(message, 'No information to update');
      });

      it('Permission deined', async function() {
        const message = await Mutation.removeCategory(null, { id: category2, category: { name: 'category' } }, { user: { id: 'tester' } }).catch(
          err => err.message
        );
        assert.equal(message, 'Permission denied');
      });

      it('empty category user', async function() {
        const message = await Mutation.updateCategory(null, { id: category2, category: {} }, { user }).catch(err => err.message);
        assert.equal(message, 'No information to update');
      });

      it('Not exist', async function() {
        const message = await Mutation.removeCategory(null, { id: '-1', category: { name: 'category' } }, { user }).catch(err => err.message);
        assert.equal(message, 'Category not found');
      });
    });

    after(async function() {
      await Mutation.removeCategory(null, { id: category1 }, { user });
      await Mutation.removeCategory(null, { id: category2 }, { user });
    });
  });

  describe('updateCategorySequence', function() {
    let token = null;
    let user = null;
    let category1 = null;
    let category2 = null;

    before(async () => {
      token = await Mutation.login(null, { user: 'category', password: 'test1234' });
      user = await verify(token);
      category1 = await Mutation.createCategory(null, null, { user });
      category2 = await Mutation.createCategory(null, null, { user });
    });

    describe('Success', function() {
      it('Update category sequence', async function() {
        const result = await Mutation.updateCategorySequence(null, { sequences: [{ _id: category1, sequence: 1 }, { _id: category2, sequence: 2 }] }, { user });
        assert.equal(result, true);
        const categories = await User.categories({ id: user.id }, {});
        assert.deepEqual(categories, [
          { _id: category2, name: '', sequence: 2, user: 'category' },
          { _id: category1, name: '', sequence: 1, user: 'category' },
        ]);
      });
    });

    after(async () => {
      await Mutation.removeCategory(null, { id: category1 }, { user });
      await Mutation.removeCategory(null, { id: category2 }, { user });
    });
  });

  describe('removeCategory', function() {
    let token = null;
    let user = null;
    let category1 = null;
    let category2 = null;

    before(async () => {
      token = await Mutation.login(null, { user: 'tester', password: 'test1234' });
      user = await verify(token);
      category1 = await Mutation.createCategory(null, null, { user });
      category2 = await Mutation.createCategory(null, null, { user });
    });

    describe('Success', function() {
      it('Remove category', async function() {
        const result = await Mutation.removeCategory(null, { id: category1 }, { user });
        assert.equal(result, true);
      });
    });

    describe('Invalid', function() {
      it('Not exist', async function() {
        const message = await Mutation.removeCategory(null, { id: category1 }, { user }).catch(err => err.message);
        assert.equal(message, 'Category not found');
      });

      it('Permission deined', async function() {
        const message = await Mutation.removeCategory(null, { id: category2 }, { user: { id: 'category' } }).catch(err => err.message);
        assert.equal(message, 'Permission denied');
      });
    });

    after(async () => {
      await Mutation.removeCategory(null, { id: category2 }, { user });
    });
  });

  describe('createCategoryItem', function() {
    let user = null;
    let category = null;

    before(async () => {
      const token = await Mutation.login(null, { user: 'category', password: 'test1234' });
      user = await verify(token);
      category = await Mutation.createCategory(null, null, { user });
    });

    describe('Success', function() {
      it('Create item', async function() {
        const item = !!(await Mutation.createCategoryItem(null, { category }, { user }));
        assert.equal(item, true);
      });
    });

    describe('Invalid', function() {
      it('Empty category', async function() {
        const message = await Mutation.createCategoryItem(null, { category: undefined }, { user }).catch(err => err.message);
        assert.equal(message, 'Category not found');
      });
    });
  });

  describe('removeCategoryItem', function() {
    let user = null;
    let category = null;
    let item = null;

    before(async () => {
      const token = await Mutation.login(null, { user: 'category', password: 'test1234' });
      user = await verify(token);
      category = await Mutation.createCategory(null, null, { user });
      item = await Mutation.createCategoryItem(null, { category }, { user });
    });

    describe('Success', function() {
      it('Remove item', async function() {
        const result = await Mutation.removeCategoryItem(null, { id: item, category }, { user });
        assert.equal(result, true);
      });
    });

    describe('Invalid', function() {
      it('Empty item', async function() {
        const message = await Mutation.createCategoryItem(null, { category: undefined }, { user }).catch(err => err.message);
        assert.equal(message, 'Category not found');
      });

      it('Not exist item', async function() {
        const message = await Mutation.removeCategoryItem(null, { id: item, category }, { user }).catch(err => err.message);
        assert.equal(message, 'Category item not found');
      });
    });
  });
});
