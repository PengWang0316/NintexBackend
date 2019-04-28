'use strict';

/*
 * A middleware to wrap some comman middlwares.
 * So all function will have these middlewares automatically.
 */
const middy = require('middy');
const {
  functionShield, ssm, doNotWaitForEmptyEventLoop, cors,
} = require('middy/middlewares');

const { STAGE } = process.env;

const { sampleLogging } = require('@kevinwang0316/lambda-middlewares');
const { initialMysqlPool } = require('@kevinwang0316/lambda-middlewares/mysql');
// const functionShield = require('./function-shield');

module.exports = func => middy(func)
  .use(cors({
    origin: '*',
    credentials: true,
  }))
  .use(ssm({
    cache: true,
    cacheExpiryInMillis: 3 * 60 * 1000,
    // Save the parameters to context instead of env.
    // The parameters will just live in memory for the security concern.
    setToContext: true,
    names: {
      dbHost: `/nintex/${STAGE}/db_host`,
      dbUser: `/nintex/${STAGE}/db_user`,
      dbPassword: `/nintex/${STAGE}/db_password`,
      dbName: `/nintex/${STAGE}/db_name`,
      FUNCTION_SHIELD_TOKEN: `/nintex/${STAGE}/function_shield_token`,
    },
  }))
  .use(sampleLogging())
  .use(functionShield({
    policy: {
      outbound_connectivity: 'alert',
      read_write_tmp: 'block',
      create_child_process: 'block',
      read_handler: 'block',
    },
  }))
  .use(doNotWaitForEmptyEventLoop())
  .use(initialMysqlPool);
