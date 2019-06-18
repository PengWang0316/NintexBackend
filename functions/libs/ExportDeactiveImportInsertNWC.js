/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const axios = require('axios');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');

const QUERY_SQL = 'INSERT INTO ?? (id, isPublished, name, authorName, authorId, authorEmail, created, eventConfiguration, eventType, isActive, lastPublished, publishedType, publishedId, tenantUrl, description, userId, exportKey) VALUES ?';

const exportDeactiveImportInsertNWC = async (workflows, sub, key, queryAsync, isAutoFetching) => {
  // Use this array to keep the import actions and deactive actions.
  const postActionArr = [];
  for (let i = 0, { length } = workflows; i < length; i++) {
    const { data: { key: exportKey } } = await axios.post(`${process.env.NWC_BASE_URL}${workflows[i][0]}/draft/export`, {}, { headers: { authorization: `Bearer ${key}` } });
    // Add the user id in and export the workflow to an preset account
    workflows[i].push(sub);
    workflows[i].push(exportKey);
    postActionArr.push(axios.post(process.env.NWC_IMPORT_URL, { key: exportKey, name: `${workflows[i][2]} - IM${workflows[i][0].substring(0, 8)}` }, { headers: { authorization: `Bearer ${process.env.NWC_AUTO_FETCH_IMPORT_KEY}`, 'content-type': 'application/json' } }));
    if (isAutoFetching && workflows[i][9] !== 0) postActionArr.push(axios.post(`${process.env.NWC_BASE_URL}${workflows[i][0]}/deactivate`, {}, { headers: { authorization: `Bearer ${key}` } }));
  }

  await axios.all(postActionArr);
  await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(
    QUERY_SQL,
    [process.env.NWCWORKFLOW_TABLE, workflows],
  ));
};
module.exports = exportDeactiveImportInsertNWC;
