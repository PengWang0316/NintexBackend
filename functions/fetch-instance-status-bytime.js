const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = `SELECT statusDate,
                   SUM(IF(status = 'Completed', instanceCount, 0)) completed,
                   SUM(IF(status = 'Failed', instanceCount, 0)) failed,
                   SUM(IF(status = 'Started', instanceCount, 0)) started,
                   SUM(IF(status = 'Faulting', instanceCount, 0)) faulting,
                   SUM(IF(status = 'Running', instanceCount, 0)) running,
                   SUM(IF(status = 'Terminated', instanceCount, 0)) terminatedInstance,
                   SUM(IF(status = 'Cancelled', instanceCount, 0)) cancelled FROM ?? WHERE userId = ? GROUP BY statusDate`;

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    const { rows } = await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(QUERY_SQL, [process.env.INSTANCES_TABLE, sub]));
    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
