'use strict';

const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync, format } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'SELECT id FROM ?? WHERE id IN (?)';
const INSERT_SQL = 'INSERT INTO ?? (id, status, name, description, listId, region, workflowType, assigneUse, tenantUrl) VALUES (?)';

const getInsertSQL = (workflows) => {
  let queries = '';
  Object.keys(workflows).forEach((key) => {
    queries += `${format(INSERT_SQL, [process.env.OFFICEWORKFLOW_TABLE, workflows[key]])};`;
  });
  return queries;
};

const handler = async (event, context) => {
  const { workflows } = JSON.parse(event.body);

  try {
    // Get a list ids for existed rows
    const { rows } = await trackExecTime('MySQL Query Latency', () => queryAsync(QUERY_SQL, [process.env.OFFICEWORKFLOW_TABLE, Object.keys(workflows)]));
    // Remove existed recoreds from workflos
    rows.forEach(({ id }) => delete workflows[id]);
    if (Object.keys(workflows).length !== 0) await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(getInsertSQL(workflows)));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
