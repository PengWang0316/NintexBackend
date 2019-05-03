/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
'use strict';

const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const sendToStepfunction = require('./libs/send-workflow-ids-stepfunction');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'INSERT INTO ?? (id, isPublished, name, authorName, authorId, authorEmail, created, eventConfiguration, eventType, isActive, lastPublished, publishedType, publishedId, tenantUrl, description) VALUES ?';

const handler = async (event, context) => {
  const { workflows, keys } = JSON.parse(event.body);
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(
      QUERY_SQL,
      [process.env.NWCWORKFLOW_TABLE, workflows],
    ));

    await sendToStepfunction(workflows, keys);
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
