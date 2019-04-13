import jwt from 'jsonwebtoken';
import { RSA } from '@/config';

import { isCanEncryptAndDecryptWithRsa, encryptDataWithRSA, decrypyDataWithRSA } from './index';

const JWT_PREFIX = 'bearer';
const ignoreJwtErrors = ['TokenExpiredError'];

const encryptJwt = isCanEncryptAndDecryptWithRsa ? encryptDataWithRSA : token => token;
const decryptJwt = isCanEncryptAndDecryptWithRsa ? decrypyDataWithRSA : token => token;
const JWT_KEY = RSA.PRIVATE_KEY || Math.random().toString();

export const createToken = async ({ iat = null, exp = null, ...data }: any) => {
  return [JWT_PREFIX, encryptJwt(jwt.sign({ ...data }, JWT_KEY, { expiresIn: '1d' }))].join(' ');
};

export const verify = async token => {
  if (!token) return null;
  const [bearer, encodedData] = token.split(' ');

  // Invalid Signature || Header not exists
  if (bearer !== JWT_PREFIX || !encodedData) return null;

  try {
    return jwt.verify(decryptJwt(encodedData), JWT_KEY);
  } catch (err) {
    if (!ignoreJwtErrors.includes(err.name)) console.error('Invalid JWT Error:', err);
    return null;
  }
};

export const authorization = async (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'] || null;
  if (token === null) return next();

  const verified = await verify(token);
  if (verified) req.user = verified;

  return next();
};
