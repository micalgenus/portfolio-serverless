export const checkEmptyItems = (items: object) => {
  for (const key in items) {
    if (items[key] === undefined) throw new Error(`Empty ${key}`);
  }
};
