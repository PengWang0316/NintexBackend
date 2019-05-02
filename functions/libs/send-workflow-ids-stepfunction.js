'use strict';

/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const AWS = require('aws-sdk');
const log = require('@kevinwang0316/cloudwatch');

AWS.config.update({ region: process.env.AWS_REGION });
const stepFunctions = new AWS.StepFunctions();

const sendWorkflowIds = (workflows, keys) => new Promise(async (resolve, reject) => {
  const workflowIds = [];
  try {
    while (workflows.length !== 0) {
      const ids = [];
      for (let i = 0; i < process.env.WORKFLOW_BATCH_NUM && workflows.length !== 0; i++) {
        const workflow = workflows.shift();
        ids.push([workflow[13], workflow[0]]);
      }
      workflowIds.push(ids);
    }
    // Start step functions one by one with an increased wait time
    if (workflowIds.length !== 0) {
      for (let i = 0; i < workflowIds.length; i++) {
        await stepFunctions.startExecution({
          stateMachineArn: process.env.FETCH_HEALTH_SCORE_SF,
          input: JSON.stringify({ keys, ids: workflowIds[i], waitTime: process.env.MESSAGE_DELAY_SECOND * i }),
        }).promise();
      }
    }
  } catch (err) {
    log.error(err);
    reject(err);
  }
  resolve();
});
module.exports = sendWorkflowIds;
