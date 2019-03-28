// import { assert } from 'chai';
// import { verify } from '@/controllers/auth';

// const Query = require('./Query');
// const Mutation = require('./Mutation');

// /* Requirement test */
// require('./Mutation.spec');

// describe('GraphQL Query', function() {
//   let token = null;
//   let user = null;

//   before(async () => {
//     token = await Mutation.login(null, { user: 'tester', password: 'test1234' });
//     user = await verify(token);
//   });

//   describe('me', function() {
//     it('get user info', async function() {
//       const userInfo = await Query.me(null, null, { user });
//       assert.deepEqual(userInfo, { BIRTH: null, BLOCK: 0, EMAIL: 'tester@gmail.com', GENDER: null, ID: 'tester', PHONE: null, USERNAME: 'tester' });
//     });

//     it('get not exist user info', async function() {
//       const message = await Query.me(null, null, { user: { _id: -1 } }).catch(err => err.message);
//       assert.equal(message, 'User not found');
//     });

//     it('not exist user object', async function() {
//       const message = await Query.me(null, null, { user: undefined }).catch(err => err.message);
//       assert.equal(message, 'You are not authenticated!');
//     });

//     it('not contain primary key in user', async function() {
//       const message = await Query.me(null, null, { user: {} }).catch(err => err.message);
//       assert.equal(message, 'Required pk');
//     });
//   });
// });
