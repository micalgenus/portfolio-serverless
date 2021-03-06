import { Datastore, Query } from '@google-cloud/datastore';
import { Operator } from '@google-cloud/datastore/build/src/query';
import TestDatastore from 'nedb';

import { checkUndefinedValue, trimString } from '@/lib/utils';

import { DatabaseConnector, DatabaseFilterItem, DatabaseFindItem, TableTemplate } from '@/typings/database';

// export Google Cloud Datastore
const datastore = new Datastore({ projectId: process.env.GOOGLE_DATASTORE_PROJECT_ID });

// Basic Methods Class
class DataStoreBasic<T extends TableTemplate> {
  fromDatastore(obj: T) {
    obj._id = obj[Datastore.KEY].id;
    return obj;
  }

  toDatastore(obj, nonIndexed) {
    nonIndexed = nonIndexed || [];
    const results = [];
    Object.keys(obj).forEach(k => {
      if (obj[k] === undefined) {
        return;
      }
      results.push({
        name: k,
        value: obj[k],
        excludeFromIndexes: nonIndexed.indexOf(k) !== -1,
      });
    });
    return results;
  }
}

// CURD Class
class DataStoreAbstract<T extends TableTemplate> extends DataStoreBasic<T> implements DatabaseConnector<T> {
  table: string;

  constructor(table: string) {
    super();
    if (table === '') throw new Error('DataStoreAbstract: kind의 값이 비어있습니다.');
    this.table = table;
  }

  async create(data: T) {
    return this.update(null, data);
  }

  async update(id: string, data: T) {
    let key;
    if (id) key = datastore.key([this.table, parseInt(id, 10)]);
    else key = datastore.key(this.table);

    // Reject the _id member
    delete data._id;

    const entity = {
      key: key,
      data: this.toDatastore(data, ['description']),
    };

    return new Promise<T>((resolve, reject) => {
      datastore.save(entity, err => {
        data._id = entity.key.id;
        if (err) return reject(err);
        else return resolve(data);
      });
    });
  }

  async read(id: string) {
    const key = datastore.key([this.table, parseInt(id, 10)]);
    return new Promise<T>((resolve, reject) => {
      datastore.get(key, (err, entity) => {
        if (!err && !entity) {
          err = {
            code: 404,
            message: 'Not found',
          };
        }
        if (err) return reject(err);
        else return resolve(this.fromDatastore(entity));
      });
    });
  }

  async runQuery(q: Query) {
    return new Promise<DatabaseFindItem<T>>((resolve, reject) => {
      datastore.runQuery(q, (err, entities, nextQuery) => {
        if (err) return reject(err);
        else {
          const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
          return resolve({ entities: entities.map(this.fromDatastore), hasMore });
        }
      });
    });
  }

  async find(filters: DatabaseFilterItem[], order?: keyof T, desc?: boolean) {
    let q = datastore.createQuery([this.table]);

    for (const filter of filters) q = q.filter(filter.key, filter.op, filter.value);
    if (order) q = q.order(order.toString(), { descending: desc || false });

    return this.runQuery(q);
  }

  async list(limit: number, order: string = 'title', token: string | Buffer) {
    const q = datastore
      .createQuery([this.table])
      .limit(limit)
      .order(order)
      .start(token);

    return this.runQuery(q);
  }

  async delete(id: string) {
    const key = datastore.key([this.table, parseInt(id, 10)]);
    return new Promise((resolve, reject) => {
      datastore.delete(key, (err, response) => {
        if (err) return reject(err);
        else return resolve(response);
      });
    });
  }
}

const executeFilterOperation = (value, op: Operator, compare) => {
  switch (op) {
    case '=':
      return value === compare;
    case '<':
      return value < compare;
    case '>':
      return value > compare;
    case '<=':
      return value <= compare;
    case '>=':
      return value >= compare;
    default:
      return false;
  }
};

class TestDataStoreAbstract<T extends TableTemplate> implements DatabaseConnector<T> {
  table: string;
  db: TestDatastore;

  constructor(table: string) {
    if (table === '') throw new Error('TestDataStoreAbstract: kind의 값이 비어있습니다.');
    this.table = table;
    this.db = new TestDatastore();
  }

  async create(data: T) {
    checkUndefinedValue(data);

    return new Promise<T>((resolve, reject) =>
      this.db.insert(data, (err, newDocs) => {
        if (err) return reject(err);
        return resolve(newDocs);
      })
    );
  }

  async update(id: string, data: T) {
    checkUndefinedValue(data);

    // Reject the _id member
    delete data._id;

    return new Promise<T>(resolve => this.db.update({ _id: id }, { $set: { ...data } }, () => resolve(this.read(id))));
  }

  async read(id: string) {
    checkUndefinedValue({ id: id });

    return new Promise<T>((resolve, reject) =>
      this.db.findOne({ _id: id }, function(err, doc: T) {
        if (err) return reject(err);
        return resolve(doc);
      })
    );
  }

  async find(filters: DatabaseFilterItem[], order?: keyof T, desc?: boolean) {
    for (const filter of filters) checkUndefinedValue(filter);

    return new Promise<DatabaseFindItem<T>>((resolve, reject) => {
      let q = this.db.find({
        $where: function() {
          return !!filters.reduce((r, filter) => {
            if (r === false) return false;
            if (executeFilterOperation(r[filter.key], filter.op, filter.value)) return r;
            return false;
          }, this);
        },
      });

      if (order) q = q.sort({ [order.toString()]: desc ? -1 : 1 });

      return q.exec(function(err, docs) {
        if (err) return reject(err);
        return resolve({ entities: docs, hasMore: false });
      });
    });
  }

  async list(limit: number, order: string, token: string | Buffer) {
    return new Promise<DatabaseFindItem<T>>((resolve, reject) =>
      this.db
        .find({})
        .skip(parseInt(token.toString(), 10) || 0)
        .sort({ [order]: 1 })
        .limit(limit || 10)
        .exec(function(err, docs) {
          if (err) return reject(err);
          return resolve({ entities: docs, hasMore: false });
        })
    );
  }

  async delete(id: string) {
    return new Promise((resolve, reject) =>
      this.db.remove({ _id: id }, function(err, result) {
        if (err) return reject(err);
        return resolve(result !== 0);
      })
    );
  }
}

/**
 * @member connector
 */
class AbstractedDataStore<T extends TableTemplate> implements DatabaseConnector<T> {
  table: string;
  connector: DatabaseConnector<T>;

  constructor(table: string) {
    this.connector = process.env.NODE_ENV === 'test' ? new TestDataStoreAbstract(table) : new DataStoreAbstract(table);
  }

  async create(data: T) {
    return this.connector.create(trimString(data));
  }
  async update(id: string, data: T) {
    return this.connector.update(id, trimString(data));
  }
  async read(id: string) {
    return this.connector.read(id);
  }
  async find(filters: DatabaseFilterItem[], order?: keyof T, desc?: boolean) {
    return this.connector.find(filters, order, desc);
  }
  async list(limit: number, order: string, token: string | Buffer) {
    return this.connector.list(limit, order, token);
  }
  async delete(id: string) {
    return this.connector.delete(id);
  }
}

export default AbstractedDataStore;
