'use strict';

/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const axios = require('axios');
const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync, format } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const SQL = 'UPDATE ?? SET completed = ?, failed = ? WHERE id = ?';

/**
 * Count how many Completed and Failed number
 * @param {array} data is an instance array
 * @return {array} return a completed and failed pair as [completed, failed]
 */
const countStatus = (data) => {
  const result = [0, 0];
  data.forEach((item) => {
    if (item.status === 'Completed') result[0]++;
    else if (item.status === 'Failed') result[1]++;
  });
  return result;
};

const fetchHealthScores = (workflowId, tenant, keys) => new Promise(async (resolve, reject) => {
  const authorization = `Bearer ${keys[tenant]}`;
  const counts = { completed: 0, failed: 0, workflowId };
  // The first fetching
  let result = await axios.get(
    `${process.env.NWC_LIST_WORKFLOWS_API}/${workflowId}/instances`,
    {
      headers: { authorization, 'cache-control': 'no-cache' },
    },
  );
  let newCount = countStatus(result.data.instances);
  counts.completed += newCount[0];
  counts.failed += newCount[1];

  while (result.data.instances.length !== 0) {
    result = await axios.get(
      result.data.next,
      {
        headers: { authorization, 'cache-control': 'no-cache' },
      },
    );
    newCount = countStatus(result.data.instances);
    counts.completed += newCount[0];
    counts.failed += newCount[1];
  }
  resolve(counts);
});

const getQueryString = (results) => {
  let queries = '';
  results.forEach((result) => {
    queries += `${format(SQL, [process.env.NWCWORKFLOW_TABLE, result.completed, result.failed, result.workflowId])};`;
  });
  return queries;
};

const handler = async (event, context) => {
  // workflowIds will be [[tenantName, id], ...]
  const workflowIds = JSON.parse(event);console.log(workflowIds);
  // keys will be { thenantNameA: keyA, ... }
  // const keys = JSON.parse(event.Records[0].messageAttributes.keys.stringValue);
  // const promiseCalls = workflowIds.map(workflow => fetchHealthScores(workflow[1], workflow[0], keys));

  try {
    // const results = await Promise.all(promiseCalls);
    // await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(getQueryString(results)));
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
