import { isChangeString } from './index';
import { UserTable } from '@/typings/database';

const idRegex = /(?!^([0-9]+)([[\\s]*]?)$)(?!^([0-9]+)[[a-zA-Z]*]?([[\\s]*]?)$)^([_]?([a-zA-Z0-9]+)([[\\s]*]?))$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const checkValidId = (id: string) => idRegex.test(id);
export const checkValidEmail = (email: string) => emailRegex.test(email);
export const checkValidPassword = (password: string) => password.length >= 8;

/**
 * @param {UserTable} data
 * @param {UserTable} compare
 * @return true: Changed
 * @return false: Not changed
 */
export const isChangeUserDataWithBefore = (data: UserTable, compare: UserTable) => {
  if (
    isChangeString(data.username, compare.username) ||
    isChangeString(data.email, compare.email) ||
    isChangeString(data.github, compare.github) ||
    isChangeString(data.linkedin, compare.linkedin) ||
    isChangeString(data.description, compare.description)
  )
    return true;

  return false;
};
