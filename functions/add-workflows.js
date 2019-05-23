

const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync, format } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const INSERT_SQL = `INSERT INTO ?? (lhProductType, lhDataSource, lhSiteList, id, workflowVersion,
                    authorDisplayName, authorEmail, tenantId, environmentId, locationId, locationName,
                    locationPath, locationUrl, assignedUse, email, location1, location2, sliceDate, location3,
                    workflowType, workflowName, publishDate, url, publisher, home, userId) VALUES (?)`;

const getInsertSQL = (workflows, userId) => {
  let queries = '';
  workflows.forEach((workflow) => {
    workflow.push(userId);
    queries += `${format(INSERT_SQL, [process.env.WORKFLOWS_TABLE, workflow])};`;
  });
  return queries;
};

const handler = async (event, context) => {
  const { workflows } = JSON.parse(event.body);
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(getInsertSQL(workflows, sub)));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
