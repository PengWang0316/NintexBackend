const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'INSERT INTO ?? (id, isPublished, name, authorName, authorId, authorEmail, created, eventConfiguration, eventType, isActive, lastPublished, publishedType, publishedId, tenantUrl, description, userId) VALUES ?';

/* If some workflow has already exsit in the database, this function will fail due to the same id.
 * We will rely on the auto fetching to catch up new recored under this situation.
 */
const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { workflows } = JSON.parse(event.body);
  // Add the user id in
  workflows.forEach(workflow => workflow.push(sub));
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(
      QUERY_SQL,
      [process.env.NWCWORKFLOW_TABLE, workflows],
    ));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
