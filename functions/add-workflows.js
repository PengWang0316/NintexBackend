const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');
const generateInsertSQL = require('./libs/generateInsertSQL');

const INSERT_SQL = `INSERT INTO ?? (lhProductType, lhDataSource, lhSiteList, id, workflowVersion,
                    authorDisplayName, authorEmail, tenantId, environmentId, locationId, locationName,
                    locationPath, locationUrl, assignedUse, email, location1, location2, sliceDate, location3,
                    workflowType, workflowName, publishDate, url, publisher, home, userId) VALUES (?)`;

const handler = async (event, context) => {
  const { workflows } = JSON.parse(event.body);
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(generateInsertSQL(INSERT_SQL, workflows, process.env.WORKFLOWS_TABLE, sub)));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
