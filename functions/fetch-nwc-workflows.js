'use strict';

const log = require('@kevinwang0316/log');
const cloudwatch = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

// Conditional insert
const QUERY_SQL = 'SELECT id, completed, failed FROM ?? WHERE id IN (?)';

const handler = async (event, context) => {
  const { ids } = JSON.parse(event.body);
  log.debug(ids);
  try {
    const { rows } = await cloudwatch.trackExecTime(
      'MySQL SELECT latency',
      () => queryAsync(
        QUERY_SQL,
        [process.env.NWCWORKFLOW_TABLE, ids],
      ),
    );
    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
