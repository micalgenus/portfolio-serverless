export { default as github } from './github';

const ALLOW_OAUTH = ['github'];

export default (req, res) => {
  const { type, code } = req.query;
  if (!type || !code || !ALLOW_OAUTH.includes(type)) return res.status(401).end();
  return res.send('oauth');
};
