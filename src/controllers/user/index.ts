import bcrypt from 'bcrypt';

import { createToken, encryptDataWithRSA, decrypyDataWithRSA } from '@/controllers/auth';

import { UserTable, OAuth } from '@/typings/database';

const idRegex = /(?!^([0-9]+)([[\\s]*]?)$)(?!^([0-9]+)[[a-zA-Z]*]?([[\\s]*]?)$)^([_]?([a-zA-Z0-9]+)([[\\s]*]?))$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const createJwtToken = async ({ _id, id, email, username }: UserTable, type?: OAuth): Promise<string> => {
  return createToken({ _id, id: id, email, username, type: type || 'LOCAL' });
};

export const createRememberMeToken = async (user, password): Promise<string> => {
  return encryptDataWithRSA(JSON.stringify({ user, password }));
};

export const decodeRememberMeToken = async (token): Promise<any> => {
  return JSON.parse(decrypyDataWithRSA(token));
};

export const compareUserPasswordAndLogin = async (user, password = null): Promise<string> => {
  if (!password) throw new Error('A password is required');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Incorrect password');

  return createJwtToken({ ...user });
};

export const checkValidId = (id: string) => idRegex.test(id);
export const checkValidEmail = (email: string) => emailRegex.test(email);
export const checkValidPassword = (password: string) => password.length >= 8;
