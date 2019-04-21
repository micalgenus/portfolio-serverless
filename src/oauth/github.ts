import rp from 'request-promise';

export default async code => {
  // const oauth = await rp({
  //   method: 'POST',
  //   uri: 'https://github.com/login/oauth/access_token',
  //   body: { client_id: process.env.GITHUB_OAUTH_CLIENT_ID, client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET, code },
  //   json: true,
  // });

  // const { access_token, token_type } = oauth;

  // const user = await rp({
  //   method: 'GET',
  //   uri: 'https://api.github.com/user',
  //   headers: { Authorization: `${token_type} ${access_token}`, 'User-Agent': 'Portfolio Serverless App' },
  //   json: true,
  // });

  // TODO: Signup and Login
  return 'AUTH TOKEN';
};
