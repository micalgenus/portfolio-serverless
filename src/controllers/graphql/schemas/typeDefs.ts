import * as inputTypes from './inputTypes';
import * as types from './types';

import Query from './Query';
import Mutation from './Mutation';

const typeDefs = [...Object.keys(inputTypes).map(k => inputTypes[k]), ...Object.keys(types).map(k => types[k]), Query, Mutation];

export default typeDefs;
