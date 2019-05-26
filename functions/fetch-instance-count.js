const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'SELECT SUM(instanceCount) count FROM ?? WHERE userId = ?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    const { rows } = await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(QUERY_SQL, [process.env.INSTANCES_TABLE, sub]));
    return { statusCode: 200, body: JSON.stringify(rows[0]) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
