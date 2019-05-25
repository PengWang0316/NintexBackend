const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');
const generateInsertSQL = require('./libs/generateInsertSQL');

const INSERT_SQL = `INSERT INTO ?? (workflowName, home, actions, url, actionPath,
                    actionUse, lastPublished, email, publisher, workflowId, workflowVersion,
                    actionLabel, actionType, locationId, locationUrl, locationName, authorEmail,
                    tenantId, category, activityName, environmentId, location1, location2, location3,
                    actionName, actionCategory, userId) VALUES (?)`;

const handler = async (event, context) => {
  const { actions } = JSON.parse(event.body);
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(generateInsertSQL(INSERT_SQL, actions, process.env.ACTIONS_TABLE, sub)));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
