/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const axios = require('axios');
const log = require('@kevinwang0316/log');

const wrapper = require('../middlewares/wrapper');

/*
 * This function is in charge of calling import API on the NWC platform
*/
const handler = async (event, context) => {
  // const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { importInstances } = JSON.parse(event.body);
  const importCallArr = importInstances.map(({ key, name }) => axios.post(
    process.env.NWC_IMPORT_URL,
    { key, name },
    { headers: { authorization: `Bearer ${process.env.NWC_AUTO_MONITOR_IMPORT_KEY}` } },
  ));

  try {
    if (importCallArr.length !== 0) await axios.all(importCallArr);
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
