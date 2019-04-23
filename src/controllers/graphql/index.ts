import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';

import { authorization } from '@/controllers/auth';

import { GraphQLExpressContext } from '@/typings';

import schema from './schemas';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(authorization);

const server = new ApolloServer({
  schema,
  context: ({ req, res }: GraphQLExpressContext) => ({ user: req.user }),
});

server.applyMiddleware({ app, path: '/', cors: { origin: true, credentials: true } });

export default app;
