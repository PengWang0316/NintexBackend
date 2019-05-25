const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');
const generateInsertSQL = require('./libs/generateInsertSQL');

const INSERT_SQL = `INSERT INTO ?? (statusDate, status, instanceCount, workflowName,
                    location1, assignedUse, dataSource, siteList, workflowId, environmentId, userId) VALUES (?)`;

const handler = async (event, context) => {
  const { instances } = JSON.parse(event.body);
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(generateInsertSQL(INSERT_SQL, instances, process.env.INSTANCES_TABLE, sub)));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
