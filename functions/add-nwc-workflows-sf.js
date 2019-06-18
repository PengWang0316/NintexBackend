/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const log = require('@kevinwang0316/log');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const exportDeactiveImportInsertNWC = require('./libs/ExportDeactiveImportInsertNWC');
const wrapper = require('../middlewares/wrapper');

/* If some workflow has already exsit in the database, this function will fail due to the same id.
 * We will rely on the auto fetching to catch up new recored under this situation.
 */
const handler = async (event, context) => {
  const {
    workflows, key, sub, isAutoFetching,
  } = event;

  try {
    await exportDeactiveImportInsertNWC(workflows, sub, key, queryAsync, isAutoFetching);
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};
module.exports.handler = wrapper(handler);
