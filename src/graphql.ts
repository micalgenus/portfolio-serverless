import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { authorization } from '@/controllers/auth';
import cors from 'cors';

import { AuthorizationExpressContext } from '@/interfaces';

import schema from '@/schemas';

const app = express();

app.use(cors());
app.use(authorization);

const server = new ApolloServer({
  schema,
  context: ({ req, res }: AuthorizationExpressContext) => ({ user: req.user }),
});

server.applyMiddleware({ app, path: '/' });

export default app;
