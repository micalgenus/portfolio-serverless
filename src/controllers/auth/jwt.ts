import jwt from 'jsonwebtoken';
import nodeRsa from 'node-rsa';

import { RSA } from '@/config';

const { PRIVATE_KEY, PUBLIC_KEY } = RSA;
const JWT_PREFIX = 'bearer';

const ignoreJwtErrors = ['TokenExpiredError'];

// isCanEncryptAndDecryptJwtWithRsa is singleton pattern (return boolean)
const isCanEncryptAndDecryptJwtWithRsa = (() => {
  if (!PRIVATE_KEY || !PUBLIC_KEY) return false;
  const originalText = 'RSA Test Text !!';

  // Create RSA objects
  const privateKey = nodeRsa(PRIVATE_KEY);
  const publicKey = nodeRsa(PUBLIC_KEY);

  // Check valid keys.
  if (privateKey.isEmpty() || publicKey.isEmpty() || !privateKey.isPrivate() || !publicKey.isPublic()) return false;

  const encryptedText = publicKey.encrypt(originalText);
  const decryptedText = privateKey.decrypt(encryptedText).toString();

  // Check valid RSA
  if (encryptedText.toString() === decryptedText || originalText !== decryptedText) return false;
  console.log('Success loading RSA encrypt module.');
  return true;
})();

const encryptJwtWithRSA = token => {
  if (!token) return null;
  const publicKey = nodeRsa(PUBLIC_KEY);

  return publicKey.encrypt(token, 'base64');
};

const decrypyJwtWithRSA = token => {
  if (!token) return null;
  const privateKey = nodeRsa(PRIVATE_KEY);

  try {
    return privateKey.decrypt(token).toString();
  } catch (err) {
    return null;
  }
};

const encryptJwt = isCanEncryptAndDecryptJwtWithRsa ? encryptJwtWithRSA : token => token;
const decryptJwt = isCanEncryptAndDecryptJwtWithRsa ? decrypyJwtWithRSA : token => token;
const JWT_KEY = PRIVATE_KEY || Math.random().toString();

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
