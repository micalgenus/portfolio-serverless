import { ApolloServer } from 'apollo-server-express';

import { authorization } from '@/controllers/auth';
import { AllowCORSExpress } from '@/lib/express';

import { GraphQLExpressContext } from '@/typings';

import schema from './schemas';

const app = AllowCORSExpress();
app.use(authorization);

const server = new ApolloServer({
  schema,
  context: ({ req, res }: GraphQLExpressContext) => ({ user: req.user }),
});

server.applyMiddleware({ app, path: '/', cors: { origin: true, credentials: true } });

export default app;
