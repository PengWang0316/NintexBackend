'use strict';

const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const UPDATE_SQL = 'UPDATE ?? SET department = ? WHERE id = ?';

const handler = async (event, context) => {
  const { value, platform, workflowId } = JSON.parse(event.body);

  try {
    await trackExecTime('MySQL Update Latency', () => queryAsync(
      UPDATE_SQL,
      [platform === 'nwc' ? process.env.NWCWORKFLOW_TABLE : process.env.OFFICEWORKFLOW_TABLE, value, workflowId],
    ));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
