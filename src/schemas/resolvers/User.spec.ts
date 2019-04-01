import { assert } from 'chai';

const User = require('./User');
const Mutation = require('./Mutation');

/* Requirement test */
require('./Mutation.spec');

describe('GraphQL User', function() {
  describe('categories', function() {
    describe('Success', function() {
      it('Get user categories', async function() {
        const categories = (await User.categories({ id: 'tester' }, {})).map(v => ({ user: v.user, name: v.name }));
        assert.deepEqual(categories, [{ user: 'tester', name: undefined }]);
      });

      it('Empty categories', async function() {
        const categories = (await User.categories({ id: 'readonly' }, {})).map(v => ({ user: v.user, name: v.name }));
        assert.deepEqual(categories, []);
      });

      it('Filtering categories', async function() {
        await Mutation.createCategory(null, null, { user: { id: 'category' } });
        const category1 = await Mutation.createCategory(null, null, { user: { id: 'category' } });
        const category2 = await Mutation.createCategory(null, null, { user: { id: 'category' } });
        const categories = await User.categories({ id: 'category' }, { filter: [category1, category2] });
        assert.equal(categories.length, 2);
      });
    });

    describe('Invalid', function() {
      it('Get not exist user info', async function() {
        const message = await User.categories({ id: 'notexist' }, {}).catch(err => err.message);
        assert.equal(message, 'User not found');
      });

      it('Invalid id', async function() {
        const message = await User.categories({ id: undefined }, {}).catch(err => err.message);
        assert.equal(message, 'Required user');
      });
    });
  });
});
