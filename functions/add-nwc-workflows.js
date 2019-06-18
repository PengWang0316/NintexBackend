/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const AWS = require('aws-sdk');
const axios = require('axios');
const log = require('@kevinwang0316/log');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const exportDeactiveImportInsertNWC = require('./libs/ExportDeactiveImportInsertNWC');
const wrapper = require('../middlewares/wrapper');

AWS.config.update({ region: process.env.AWS_REGION });
const stepFunctions = new AWS.StepFunctions();

/* If some workflow has already exsit in the database, this function will fail due to the same id.
 * We will rely on the auto fetching to catch up new recored under this situation.
 */
const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { workflows, key, isAutoFetching } = JSON.parse(event.body);

  try {
    if (workflows.length < process.env.LIMIT_BATCH_NUMBER) await exportDeactiveImportInsertNWC(workflows, sub, key, queryAsync, isAutoFetching);
    else { // If we have too many workflows, send the workload to different step functions
      for (let i = 0, { length } = workflows; i < length / process.env.BATCH_NUMBER; i++) {
        await stepFunctions.startExecution({
          stateMachineArn: process.env.EXPORT_IMPORT_SF,
          input: JSON.stringify({
            workflows: workflows.slice(i * process.env.BATCH_NUMBER, i * process.env.BATCH_NUMBER + process.env.BATCH_NUMBER),
            sub,
            key,
            waitTime: process.env.DELAY_SECOND * i,
            isAutoFetching,
          }),
        }).promise();
      }
    }
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
