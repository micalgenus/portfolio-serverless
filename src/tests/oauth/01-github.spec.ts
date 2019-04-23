import { assert } from 'chai';

import { gql } from '@/tests/config';
import { oauthAsync, graphQLAsync } from '@/tests/http';

import { userInformation } from '@/mock/oauth/github.json';

const query = gql`
  query {
    me {
      github
    }
  }
`;

describe('Github OAuth', () => {
  describe('Success', () => {
    it('Signup', async () => {
      const signup = await oauthAsync({ code: 'mockCode', type: 'github' });

      const user = await graphQLAsync({ query, authorization: signup.body.token });
      assert.equal(user.body.data.me.github, userInformation.html_url);
    });

    it('Login', async () => {
      const login = await oauthAsync({ code: 'mockCode', type: 'github' });

      const user = await graphQLAsync({ query, authorization: login.body.token });
      assert.equal(user.body.data.me.github, userInformation.html_url);
    });
  });
});
