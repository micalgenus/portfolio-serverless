import { Operator } from '@google-cloud/datastore/build/src/query';

export interface DatabaseFindItem<T> {
  entities: T[];
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
export interface DatabaseConnector<T> {
  table: string;
  create: (data: any) => Promise<T>;
  update: (id: string, data: any) => Promise<T>;
  read: (id: string) => Promise<T>;
  find: (filters: DatabaseFilterItem[]) => Promise<DatabaseFindItem<T>>;
  list: (limit: number, order: string, token: string | Buffer) => Promise<DatabaseFindItem<T>>;
  delete: (id: string) => Promise<any>;
}

interface TableTemplate {
  _id?: any;
}

/**
 * @member id
 * @member email
 * @member username
 * @member password
 * @member github
 * @member linkedin
 * @member description
 * @member isAdmin
 */
export interface UserTable extends TableTemplate {
  id: string;
  email: string;
  username: string;
  password: string;
  github?: string;
  linkedin?: string;
  description?: string;

  isAdmin?: boolean;
}

export interface CategoryTable extends TableTemplate {
  user: string;
  name?: string;
}
