import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Request } from 'express';

import './database';

declare namespace portfolio {
  interface GraphQLRequest extends Request {
    user?: object;
  }

  interface GraphQLExpressContext extends ExpressContext {
    req: GraphQLRequest;
  }
}

export = portfolio;
