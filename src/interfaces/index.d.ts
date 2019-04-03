import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Request } from 'express';

export * from './database';

/**
 * @extends Express.Request
 * @desc Add AuthorizationRequest.user
 */
export interface GraphQLRequest extends Request {
  user?: object;
}

/**
 * @extends ExpressContext
 * @desc Add AuthorizationExpressContext.req.user
 */
export interface GraphQLExpressContext extends ExpressContext {
  req: GraphQLRequest;
}
