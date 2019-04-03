import express from 'express';
import { createClient } from 'redis';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { authorization } from '@/controllers/auth';

import { GraphQLExpressContext } from '@/interfaces';

import schema from '@/schemas';

export const redis = createClient({ host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT, 10), password: process.env.REDIS_PASSWORD });
redis.on('error', err => {
  if (process.env.NODE_ENV !== 'test') console.error(err);
});

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(authorization);

const server = new ApolloServer({
  schema,
  context: ({ req, res }: GraphQLExpressContext) => ({ user: req.user, redis: redis }),
});

server.applyMiddleware({ app, path: '/', cors: { origin: true, credentials: true } });

export default app;
