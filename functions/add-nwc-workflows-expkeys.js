const axios = require('axios');
const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'INSERT INTO ?? (id, isPublished, name, authorName, authorId, authorEmail, created, eventConfiguration, eventType, isActive, lastPublished, publishedType, publishedId, tenantUrl, description, userId, exportKey) VALUES ?';

/* If some workflow has already exsit in the database, this function will fail due to the same id.
 * We will rely on the auto fetching to catch up new recored under this situation.
 */
const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { workflows, key } = JSON.parse(event.body);
  try {
    // Add the user id in and export the workflow to an preset account
    const importActionArr = [];
    workflows.forEach(async (workflow) => {
      const { data: { key: exportKey } } = await axios.post(`${process.env.NWC_EXPORT_URL}${workflow.id}/draf/export`, { workflowId: workflow.id }, { heards: { authorization: `Bearer ${key}` } });
      workflow.push(sub);
      workflow.push(exportKey);
      importActionArr.push(axios.post(process.env.NWC_IMPORT_URL, { key: exportKey, name: `IM${workflow.id.substring(0, 8)}` }, { headers: { authorization: `Bearer ${process.env.NWC_AUTO_FETCH_IMPORT_KEY}` } }));
    });

    await axios.all(importActionArr);

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
