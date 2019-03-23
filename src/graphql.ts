import express from 'express';
import { ApolloServer } from 'apollo-server-express';
// const { authorization } = require('@/controllers/auth/jwt');

const schema = require('@/schemas');

const app = express();

// app.use(authorization);

const server = new ApolloServer({
  schema,
  // context: ({ req, res }) => ({ user: req.user }),
});

server.applyMiddleware({ app, path: '/' });

export default app;
