import nodeRsa from 'node-rsa';
import { RSA } from '@/config';

const { PRIVATE_KEY, PUBLIC_KEY } = RSA;

/**
 * @description isCanEncryptAndDecryptJwtWithRsa is singleton pattern (return boolean)
 * @return {boolean}
 */
export const isCanEncryptAndDecryptWithRsa = (() => {
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

export const encryptDataWithRSA = (data: string) => {
  if (!isCanEncryptAndDecryptWithRsa) throw new Error('Encrypt data must be required RSA');
  if (!data) return null;
  const publicKey = nodeRsa(PUBLIC_KEY);

  return publicKey.encrypt(data, 'base64');
};

export const decrypyDataWithRSA = token => {
  if (!isCanEncryptAndDecryptWithRsa) throw new Error('Decrypt data must be required RSA');
  if (!token) return null;
  const privateKey = nodeRsa(PRIVATE_KEY);

  try {
    return privateKey.decrypt(token).toString();
  } catch (err) {
    return null;
  }
};

export * from './jwt';
