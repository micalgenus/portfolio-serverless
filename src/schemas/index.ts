import fs from 'fs';
import path from 'path';

import { makeExecutableSchema } from 'graphql-tools';

import * as types from './types';

const RESOLVER_DIR = 'resolvers';
const RESOLVER_EXT = '.js';
const REMOVE_FILES = ['.spec'];

// Define our schema using the GraphQL schema language
const typeDefs = [...Object.keys(types).map(k => types[k])];

// rs = require(resolvers/*.js) (without extension)
const rs = fs
  .readdirSync(path.join(__dirname, RESOLVER_DIR))
  .filter(v => path.extname(v) === RESOLVER_EXT)
  .map(v => path.basename(v, RESOLVER_EXT))
  // Remove test files
  .filter(v => !REMOVE_FILES.includes(path.extname(v)));

// resolvers = { [resolver]: require(resolver) }
const resolvers = {};
for (let resolver of rs) resolvers[resolver] = require(path.join(__dirname, RESOLVER_DIR, resolver));

export default makeExecutableSchema({ typeDefs, resolvers });
