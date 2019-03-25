import { Datastore } from '@google-cloud/datastore';

// export Google Cloud Datastore
const datastore = new Datastore({ projectId: process.env.GOOGLE_DATASTORE_PROJECT_ID });

// Basic Methods Class
class DataStoreBasic {
  fromDatastore(obj) {
    obj.id = obj[Datastore.KEY].id;
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
export class DataStoreAbstract extends DataStoreBasic {
  kind: string;

  constructor(kind: string) {
    super();
    if (kind === '') throw new Error('DataStoreAbstract: kind의 값이 비어있습니다.');
    this.kind = kind;
  }

  async create(data) {
    return this.update(null, data);
  }

  async update(id: number, data) {
    let key;
    if (id) key = datastore.key([this.kind, Math.floor(id || NaN)]);
    else key = datastore.key(this.kind);

    const entity = {
      key: key,
      data: this.toDatastore(data, ['description']),
    };

    return new Promise((resolve, reject) => {
      datastore.save(entity, err => {
        data.id = entity.key.id;
        if (err) return reject(err);
        else return resolve(data);
      });
    });
  }

  async read(id: number) {
    const key = datastore.key([this.kind, Math.floor(id || NaN)]);
    return new Promise((resolve, reject) => {
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

  async list(limit: number, order: string = 'title', token: string | Buffer) {
    const q = datastore
      .createQuery([this.kind])
      .limit(limit)
      .order(order)
      .start(token);

    return new Promise((resolve, reject) => {
      datastore.runQuery(q, (err, entities, nextQuery) => {
        if (err) return reject(err);
        else {
          const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
          return resolve({ entities: entities.map(this.fromDatastore), hasMore });
        }
      });
    });
  }

  async delete(id: number) {
    const key = datastore.key([this.kind, Math.floor(id || NaN)]);
    return new Promise((resolve, reject) => {
      datastore.delete(key, (err, response) => {
        if (err) return reject(err);
        else return resolve(response);
      });
    });
  }
}
