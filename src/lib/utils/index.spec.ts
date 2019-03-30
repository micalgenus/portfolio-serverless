import { assert } from 'chai';

import * as utils from './index';
import * as User from './user';

describe('Utils library', function() {
  describe('index', function() {
    it('checkEmptyItems empty items', function() {
      try {
        utils.checkEmptyItems({ test1: 1, test2: undefined });
        assert.equal('throw error', false);
      } catch (err) {
        assert.equal(err.message, 'Empty test2');
      }

      try {
        utils.checkEmptyItems({});
        assert.equal(true, true);
      } catch (err) {
        assert.equal('throw error', err);
      }
    });

    it('checkEmptyItems exist items', function() {
      try {
        utils.checkEmptyItems({ test1: 1, test2: 2 });
        assert.equal(true, true);
      } catch (err) {
        assert.equal('throw error', err);
      }
    });
  });

  describe('user', function() {
    it('checkValidId valid', function() {
      assert.equal(User.checkValidId('a'), true);
      assert.equal(User.checkValidId('a1234'), true);
      assert.equal(User.checkValidId('ab234'), true);
      assert.equal(User.checkValidId('abc34'), true);
      assert.equal(User.checkValidId('abcd4'), true);
      assert.equal(User.checkValidId('abcde'), true);
    });

    it('checkValidId invalid', function() {
      assert.equal(User.checkValidId('1234'), false);
      assert.equal(User.checkValidId('abcd@efgh'), false);
      assert.equal(User.checkValidId('asdf asdf'), false);
      assert.equal(User.checkValidId('test"test'), false);
      assert.equal(User.checkValidId('a!@#$%^&*()_+'), false);
    });

    it('checkValidEmail valid', function() {
      assert.equal(User.checkValidEmail('123@asdf.com'), true);
      assert.equal(User.checkValidEmail('test@gmail.com'), true);
      assert.equal(User.checkValidEmail('test.test@gmail.com'), true);
    });

    it('checkValidEmail invalid', function() {
      assert.equal(User.checkValidEmail('test'), false);
      assert.equal(User.checkValidEmail('test@'), false);
      assert.equal(User.checkValidEmail('test@asdf'), false);
      assert.equal(User.checkValidEmail('abc@a@sdf.com'), false);
      assert.equal(User.checkValidEmail('#$%^&*()@sdf.com'), false);
    });
  });
});
