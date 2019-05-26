const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const INSERT_SQL = 'SELECT COUNT(*) count FROM ?? WHERE userId = ?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    const result = await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(INSERT_SQL, [process.env.WORKFLOWS_TABLE, sub]));
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
