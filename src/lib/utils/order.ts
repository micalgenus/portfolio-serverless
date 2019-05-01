import { OrderingTable } from '@/typings/database';
import { updateCacheItem } from '@/lib/utils/cache';
import Datastore from '@/models';

/**
 *
 * @param id _id of want find item.
 * @param sequence Sequence number of items.
 * @param database DatabaseModel for database methods
 * @return {boolean} true Success
 * @return {boolean} false Fail
 */
export const updateOrder = async <T extends OrderingTable, D extends Datastore<T>>(id: string, sequence: number, database: D): Promise<boolean> => {
  if (!(sequence > 0)) throw new Error('Sequence must be positive integer');

  const item = await database.read(id);
  if (!item) throw new Error('item not found in updateOrder');

  if (item.sequence === sequence) return true;
  item.sequence = sequence;

  // TODO: Update items with transaction
  const updated = await database.update(id, item);
  if (!updated) throw new Error('Fail order update in updateOrder');
  return true;
};

/**
 *
 * @param parent _id of parent item
 * @param items Array of ordering item
 * @param database DatabaseModel for database methods
 * @return {boolean} true Success
 * @return {boolean} false Fail
 */
export const updateItemsOrder = async <T extends OrderingTable, D extends Datastore<T>>(
  parent: string,
  items: T[],
  database: D,
  getCacheKey: (string) => string
): Promise<boolean> => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.sequence !== items.length - i) {
      await updateOrder(item._id.toString(), items.length - i, database);
      items[i].sequence = items.length - i;
    }
  }

  const result = await updateCacheItem(parent, items, getCacheKey);
  if (!result) throw new Error('updateItemsOrder: Fail update sequence');
  return true;
};

/**
 *
 * @param items Original items
 * @param sequences Sequences for change.
 * @returns {items} Changed items
 */
export const orderingSequences = async <T extends OrderingTable>(items: T[], sequences: { _id: string; sequence: number }[]): Promise<T[]> => {
  // Update sequence by {sequences}
  for (const sequence of sequences) {
    for (const item of items) {
      if (item._id.toString() === sequence._id.toString()) item.sequence = sequence.sequence;
    }
  }

  // ORDER BY `sequence` DESC
  items.sort((a, b) => b.sequence - a.sequence);
  return items;
};
