export const checkEmptyItems = (items: object) => {
  for (const key in items) {
    if (items[key] === undefined || items[key] === '') throw new Error(`Empty ${key}`);
  }
};

export const checkUndefinedValue = (items: any) => {
  for (const key in items) {
    if (items[key] === undefined || items[key] === null) {
      throw new Error('Unsupported field value, undefined, was provided');
    }
  }
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
export const isChangeString = (left: string, right: string) => (left === undefined ? false : !isSameStringWithEmpty(left, right));
