import { TableTemplate } from '@/typings/database';

export const checkEmptyItems = (items: object) => {
  for (const key in items) {
    if (items[key] === undefined || items[key] === '' || items[key] === null || (typeof items[key] === 'object' && items[key].length === 0))
      throw new Error(`Empty ${key}`);
  }
};

export const checkUndefinedValue = <T extends {}>(items: T) => {
  for (const key in items) {
    if (items[key] === undefined) {
      throw new Error('Unsupported field value, undefined, was provided');
    }
  }
};

export const checkAllUndefinedValue = <T extends {}>(items: T) => {
  for (const key in items) {
    if (items[key] !== undefined) return;
  }

  throw new Error('No information to update');
};

/**
 * @return true: Same
 * @return false: Difference
 */
export const isSameStringWithEmpty = (left: string, right: string) => (left || '') === (right || '');

/**
 * @return true: Changed
 * @return false: Not changed
 */
export const isChangeString = (left: string, right: string) => !isSameStringWithEmpty(left, right);

/**
 * @param {TableTemplate} data
 * @param {TableTemplate} compare
 * @return true: Changed
 * @return false: Not changed
 */
export const isChangeDataWithBefore = <T extends TableTemplate>(data: T, compare: T) => {
  for (const key in data) {
    if (isChangeString(data[key] && data[key].toString(), compare[key] && compare[key].toString())) return true;
  }

  return false;
};

export const updateNewDataWithoutUndefined = <T extends TableTemplate>(oldData: T, newData: T): T => {
  const template = { ...oldData };
  for (const i in newData) template[i] = (newData[i] === undefined ? oldData[i] : newData[i]) || null;

  return template;
};
