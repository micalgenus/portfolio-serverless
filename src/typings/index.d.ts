import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Request } from 'express';

export interface GraphQLRequest extends Request {
  user?: object;
}

export interface GraphQLExpressContext extends ExpressContext {
  req: GraphQLRequest;
}

export interface OAuthTokenResponse {
  errorMessage?: string;
  token?: string;
}
