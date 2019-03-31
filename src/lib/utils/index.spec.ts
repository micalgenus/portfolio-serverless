import { assert } from 'chai';

import * as utils from './index';
import * as User from './user';

describe('Utils library', function() {
  describe('index', function() {
    describe('checkEmptyItems', function() {
      describe('Empty items', function() {
        it('Undefined data', function() {
          try {
            utils.checkEmptyItems({ test1: 1, test2: undefined });
            assert.equal('throw error', false);
          } catch (err) {
            assert.equal(err.message, 'Empty test2');
          }
        });

        it('Empty data', function() {
          try {
            utils.checkEmptyItems({});
            assert.equal(true, true);
          } catch (err) {
            assert.equal('throw error', err);
          }
        });
      });

      describe('Valid Data', function() {
        it('Not empty data', function() {
          try {
            utils.checkEmptyItems({ test1: 1, test2: 2 });
            assert.equal(true, true);
          } catch (err) {
            assert.equal('throw error', err);
          }
        });
      });
    });
  });

  describe('user', function() {
    describe('checkValidId', function() {
      describe('Valid ID', function() {
        it('Short id', function() {
          assert.equal(User.checkValidId('a'), true);
        });

        it('Alphabet and number', function() {
          assert.equal(User.checkValidId('a1234'), true);
        });

        it('Only alphabet', function() {
          assert.equal(User.checkValidId('abcde'), true);
        });
      });

      describe('Invalid ID', function() {
        it('Only number', function() {
          assert.equal(User.checkValidId('1234'), false);
        });
        it('Start character is number', function() {
          assert.equal(User.checkValidId('1234abc'), false);
        });
        it('Contain character "@"', function() {
          assert.equal(User.checkValidId('abcd@efgh'), false);
        });
        it('Contain character " "(white space)', function() {
          assert.equal(User.checkValidId('asdf asdf'), false);
        });
        it('Contain character double quote', function() {
          assert.equal(User.checkValidId('test"test'), false);
        });
        it('Contain special characters', function() {
          assert.equal(User.checkValidId('a!@#$%^&*()_+'), false);
        });
      });
    });

    describe('checkValidEmail', function() {
      describe('Valid', function() {
        it('Only number', function() {
          assert.equal(User.checkValidEmail('123@asdf.com'), true);
        });
        it('Only alphabet', function() {
          assert.equal(User.checkValidEmail('test@gmail.com'), true);
        });
        it('Contain dot character', function() {
          assert.equal(User.checkValidEmail('test.test@gmail.com'), true);
        });
      });

      describe('Invalid', function() {
        it('Without @', function() {
          assert.equal(User.checkValidEmail('test'), false);
        });
        it('Without domain', function() {
          assert.equal(User.checkValidEmail('test@'), false);
        });
        it('Without sub domain', function() {
          assert.equal(User.checkValidEmail('test@asdf'), false);
        });
        it('Multiple @', function() {
          assert.equal(User.checkValidEmail('abc@a@sdf.com'), false);
        });
        it('Contain special characters', function() {
          assert.equal(User.checkValidEmail('#$%^&*()@sdf.com'), false);
        });
      });
    });
  });
});
