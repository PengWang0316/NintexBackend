/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
'use strict';

const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION });
const sqs = new AWS.SQS();

const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const QUERY_SQL = 'INSERT INTO ?? (id, isPublished, name, authorName, authorId, authorEmail, created, eventConfiguration, eventType, isActive, lastPublished, publishedType, publishedId, tenantUrl, description) VALUES ?';

const sendMessage = messages => sqs.sendMessageBatch({
  Entries: messages,
  QueueUrl: process.env.FETCH_HEALTH_SCORE_Q,
}).promise();

const handler = async (event, context) => {
  const { workflows, keys } = JSON.parse(event.body);
  try {
    await trackExecTime('MySQL Batch Insert Latency', () => queryAsync(
      QUERY_SQL,
      [process.env.NWCWORKFLOW_TABLE, workflows],
    ));

    // Separating the new workflow to SQS
    let delayTimer = 0;
    let messages = [];
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
        await sendMessage(messages);
        messages = [];
      }
    }
    if (messages.length !== 0) await sendMessage(messages);
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
