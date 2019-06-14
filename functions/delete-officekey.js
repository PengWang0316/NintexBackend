const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const DELETE_SQL = 'DELETE FROM ?? WHERE id = ? AND userId = ?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { id } = event.queryStringParameters;
  try {
    await trackExecTime('MySQL DELETE Latency', () => queryAsync(DELETE_SQL, [process.env.OFFICEKEYS_TABLE, id, sub]));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
