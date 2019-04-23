import '@/config';

import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.should();

export const expect = chai.expect;

export const gql = (query: TemplateStringsArray) => query.join('');
