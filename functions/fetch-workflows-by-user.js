const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_WORKFLOWS_SQL = 'SELECT id as workflowId, workflowName, publishDate, publisher, locationPath, tags FROM ?? Where userId=?';
const QUERY_NWCWORKFLOW_SQL = 'SELECT id as workflowId, name as workflowName, created as publishDate, authorName as publisher, tags, isActive, tenantUrl as tenant, isMonitored FROM ?? WHERE userId=?';
// const QUERY_OFFIC_WORKFLOW_SQL = 'SELECT id as workflowId, name as workflowName, tags, tenantUrl as tenant FROM ?? WHERE userId=?';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    // const { rows } = await trackExecTime('MySQL Batch Query Latency', () => queryAsync(QUERY_WORKFLOWS_SQL, [process.env.WORKFLOWS_TABLE, sub]));
    const data = await Promise.all([
      trackExecTime('MySQL Batch Query Latency', () => queryAsync(QUERY_WORKFLOWS_SQL, [process.env.WORKFLOWS_TABLE, sub])),
      trackExecTime('MySQL Batch Query Latency', () => queryAsync(QUERY_NWCWORKFLOW_SQL, [process.env.NWCWORKFLOW_TABLE, sub])),
      // trackExecTime('MySQL Batch Query Latency', () => queryAsync(QUERY_OFFIC_WORKFLOW_SQL, [process.env.OFFICEWORKFLOW_TABLE, sub])),
    ]);
    return {
      statusCode: 200,
      body: JSON.stringify([...data[0].rows, ...data[1].rows]),
    };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
