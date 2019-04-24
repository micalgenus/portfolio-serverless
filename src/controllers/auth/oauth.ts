import GITHUB from './github';

import { AllowCORSExpress } from '@/lib/express';

import OAuthModel from '@/models/OAuth';
import UserModel from '@/models/User';

import { OAuthTokenResponse } from '@/typings';
import { OAuth, UserTable } from '@/typings/database';
import { verify } from './jwt';

const commands = {
  GITHUB,
};

const ALLOWS = Object.keys(commands);

const defaultOAuthRoute = async (req, res): Promise<OAuthTokenResponse> => {
  const { type: t, code } = req.query;
  if (!t || !code) return res.status(401).end();

  const type = t.toUpperCase();
  if (!ALLOWS.includes(type)) return res.status(401).end();

  const { token, errorMessage } = await commands[type](code);
  if (errorMessage) return res.status(500).json({ error: errorMessage });

  return res.json({ token });
};

const app = AllowCORSExpress();
app.use(defaultOAuthRoute);

export default app;

export const findAndCreateUser = async (type: OAuth, _id: string, { id, password, email, ...userInfo }: UserTable): Promise<string> => {
  // Find
  const exist = await OAuthModel.getConnectOAuthUser(type, _id);
  if (exist) return UserModel.loginOAuthByPk(type, exist);

  // Create User
  const token = await UserModel.signupOAuth(type, userInfo).catch(() => null);
  if (!token) return null;

  // Connect User to OAuth
  const user: any = await verify(token);
  const connected = await OAuthModel.connectToUser(type, _id, user._id).catch(() => null);
  if (!connected) {
    // TODO: Remove created user #3
    return null;
  }

  // Login
  return UserModel.loginOAuthByPk(type, user._id);
};
