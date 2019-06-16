const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const UPDATE_SQL = 'UPDATE ?? SET isActive = ? WHERE id = ? AND userId = ?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { workflowId, isActive } = JSON.parse(event.body);
  try {
    await trackExecTime('MySQL UPDATE Latency', () => queryAsync(UPDATE_SQL, [process.env.NWCWORKFLOW_TABLE, isActive, workflowId, sub]));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
