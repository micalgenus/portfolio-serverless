export const checkEmptyItems = (items: object) => {
  for (const key in items) {
    if (!items[key]) throw new Error(`Empty ${key}`);
  }
};
