'use strict';

/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const AWS = require('aws-sdk');
const log = require('@kevinwang0316/cloudwatch');

AWS.config.update({ region: process.env.AWS_REGION });
const sqs = new AWS.SQS();

const send = messages => sqs.sendMessageBatch({
  Entries: messages,
  QueueUrl: process.env.FETCH_HEALTH_SCORE_Q,
}).promise();

const sendMessage = (workflows, keys) => new Promise(async (resolve, reject) => {
  // Separating the new workflow to SQS
  let delayTimer = 0;
  let messages = [];
  try {
    while (workflows.length !== 0) {
      const ids = [];
      for (let i = 0; i < process.env.SQS_BATCH_NUM && workflows.length !== 0; i++) {
        const workflow = workflows.shift();
        ids.push([workflow[13], workflow[0]]);
      }
      messages.push({
        Id: delayTimer.toString(),
        DelaySeconds: process.env.MESSAGE_DELAY_SECOND * delayTimer++,
        MessageBody: JSON.stringify(ids),
        MessageAttributes: { keys: { DataType: 'String', StringValue: JSON.stringify(keys) } },
      });
      if (messages.length === 10) {
        await send(messages);
        messages = [];
      }
    }
    if (messages.length !== 0) await send(messages);
  } catch (err) {
    log.error(err);
    reject(err);
  }
  resolve();
});
module.exports = sendMessage;
