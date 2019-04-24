import rp from 'request-promise';

import { findAndCreateUser } from './oauth';

import { OAuthTokenResponse } from '@/typings';

const isTest = process.env.NODE_ENV === 'test';

const mockData = isTest ? require('@/mock/oauth/github.json') : {};
const { accessToken, userInformation } = mockData;

const getAccessTokenMock = async (code: string): Promise<any> => new Promise(resolve => resolve(accessToken));
const getAccessTokenRequest = async (code: string): Promise<any> =>
  rp({
    method: 'POST',
    uri: 'https://github.com/login/oauth/access_token',
    body: { client_id: process.env.GITHUB_OAUTH_CLIENT_ID, client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET, code },
    json: true,
  });

const getUserInformationMock = async (type: string, token: string): Promise<any> => new Promise(resolve => resolve(userInformation));
const getUserInformationRequest = async (type: string, token: string): Promise<any> =>
  rp({
    method: 'GET',
    uri: 'https://api.github.com/user',
    headers: { Authorization: `${type} ${token}`, 'User-Agent': 'Portfolio Serverless App' },
    json: true,
  });

const getAccessToken = isTest ? getAccessTokenMock : getAccessTokenRequest;
const getUserInformation = isTest ? getUserInformationMock : getUserInformationRequest;

export default async (code: string): Promise<OAuthTokenResponse> => {
  const oauth = await getAccessToken(code);
  if (oauth.error) return { errorMessage: oauth.error };

  const user = await getUserInformation(oauth.token_type, oauth.access_token);
  if (user.error) return { errorMessage: user.error };

  const token = await findAndCreateUser('GITHUB', user.id, { username: user.name, github: user.html_url, description: user.bio });
  if (!token) return { errorMessage: 'Server Error' };

  return { token };
};
