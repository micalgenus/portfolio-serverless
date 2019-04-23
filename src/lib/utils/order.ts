import { OrderingTable } from '@/typings/database';

/**
 *
 * @param id _id of want find item.
 * @param sequence Sequence number of items.
 * @param read Read item method in DatabaseModel
 * @param update Update item method in DatabaseModel
 * @return {boolean} true Success
 * @return {boolean} false Fail
 */
export const updateOrder = async <T extends OrderingTable>(
  id: string,
  sequence: number,
  read: (id: string) => Promise<T>,
  update: (id: string, data: T) => Promise<T>
): Promise<boolean> => {
  if (!(sequence > 0)) throw new Error('Sequence must be positive integer');

  const item = await read(id);
  if (!item) throw new Error('item not found in updateOrder');

  if (item.sequence === sequence) return true;
  item.sequence = sequence;

  // TODO: Update items with transaction
  const updated = await update(id, item);
  if (!updated) throw new Error('Fail order update in updateOrder');
  return true;
};

/**
 *
 * @param parent _id of parent item
 * @param items Array of ordering item
 * @param read Read item method in DatabaseModel
 * @param update Update item method in DatabaseModel
 * @param updateCache Update cache data method in DatabaseModel
 * @return {boolean} true Success
 * @return {boolean} false Fail
 */
export const updateItemsOrder = async <T extends OrderingTable>(
  parent: string,
  items: T[],
  read: (id: string) => Promise<T>,
  update: (id: string, data: T) => Promise<T>,
  updateCache: (id: string, items: T[]) => Promise<boolean>
): Promise<boolean> => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.sequence !== items.length - i) {
      await updateOrder(item._id.toString(), items.length - i, read, update);
      items[i].sequence = items.length - i;
    }
  }

  const result = await updateCache(parent, items);
  if (!result) throw new Error('Fail update category items sequence');
  return true;
};
