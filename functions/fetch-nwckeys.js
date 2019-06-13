const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'SELECT id, tenant, apiKey FROM ?? WHERE userId = ?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    const { rows } = await trackExecTime('MySQL Query Latency', () => queryAsync(QUERY_SQL, [process.env.NWCKEYS_TABLE, sub]));
    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
