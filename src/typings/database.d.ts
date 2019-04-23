import { Operator } from '@google-cloud/datastore/build/src/query';

declare namespace portfolio {
  interface DatabaseFindItem<T extends TableTemplate> {
    entities: T[];
    hasMore: string | false;
  }

  /**
   * @member key
   * @member op
   * @member value
   */
  interface DatabaseFilterItem {
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
  interface DatabaseConnector<T> {
    table: string;
    create: (data: any) => Promise<T>;
    update: (id: string, data: any) => Promise<T>;
    read: (id: string) => Promise<T>;
    find: (filters: DatabaseFilterItem[], order?: keyof T, desc?: boolean) => Promise<DatabaseFindItem<T>>;
    list: (limit: number, order: string, token: string | Buffer) => Promise<DatabaseFindItem<T>>;
    delete: (id: string) => Promise<any>;
  }

  interface TableTemplate {
    _id?: string | number;
  }

  interface OrderingTable extends TableTemplate {
    sequence?: number;
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
  interface UserTable extends TableTemplate {
    id?: string;
    email?: string;
    username?: string;
    password?: string;
    github?: string;
    linkedin?: string;
    description?: string;
    isAdmin?: boolean;
  }

  interface CategoryTable extends OrderingTable {
    user?: string;
    name?: string;
  }

  interface CategoryItemTable extends OrderingTable {
    category?: string;
    name?: string;
    description?: string;
  }
}

export = portfolio;
