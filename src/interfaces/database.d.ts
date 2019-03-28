import { Operator } from '@google-cloud/datastore/build/src/query';

export interface DatabaseFindItem {
  entities: object[];
  hasMore: string | false;
}

/**
 * @member key
 * @member op
 * @member value
 */
export interface DatabaseFilterItem {
  key: string;
  op: Operator;
  value: any;
}

/**
 * @desc Database CURD abstract
 * @method create
 * @method update
 * @method read
 * @method list
 * @method delete
 */
export interface DatabaseConnector {
  table: string;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  read: (id: string) => Promise<any>;
  find: (filters: DatabaseFilterItem[]) => Promise<DatabaseFindItem>;
  list: (limit: number, order: string, token: string | Buffer) => Promise<DatabaseFindItem>;
  delete: (id: string) => Promise<any>;
}
