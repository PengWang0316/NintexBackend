/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
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
    // Use this array to keep the import actions and deactive actions.
    const postActionArr = [];
    for (let i = 0, { length } = workflows; i < length; i++) {
      const { data: { key: exportKey } } = await axios.post(`${process.env.NWC_BASE_URL}${workflows[i][0]}/draft/export`, {}, { headers: { authorization: `Bearer ${key}` } });
      // Add the user id in and export the workflow to an preset account
      workflows[i].push(sub);
      workflows[i].push(exportKey);
      postActionArr.push(axios.post(process.env.NWC_IMPORT_URL, { key: exportKey, name: `IM${workflows[i][0].substring(0, 8)}` }, { headers: { authorization: `Bearer ${process.env.NWC_AUTO_FETCH_IMPORT_KEY}`, 'content-type': 'application/json' } }));
      if (workflows[i][9] !== 0) postActionArr.push(axios.post(`${process.env.NWC_BASE_URL}${workflows[i][0]}/deactivate`, {}, { headers: { authorization: `Bearer ${key}` } }));
    }

    await axios.all(postActionArr);
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
