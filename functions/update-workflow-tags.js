const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const UPDATE_SQL = 'UPDATE ?? SET tags = ? WHERE userId = ? AND id = ?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { tags, id } = JSON.parse(event.body);
  try {
    await trackExecTime('MySQL Update Latency', () => queryAsync(UPDATE_SQL, [process.env.WORKFLOWS_TABLE, tags, sub, id]));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
