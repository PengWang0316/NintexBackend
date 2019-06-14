const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const INSERT_SQL = 'INSERT INTO ?? (endpoint, apiKey, cookie, userId) VALUES (?, ?, ?, ?)';

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { endpoint, key, cookie } = JSON.parse(event.body);
  try {
    const { rows: { insertId } } = await trackExecTime('MySQL Insert Latency', () => queryAsync(INSERT_SQL, [process.env.OFFICEKEYS_TABLE, endpoint, key, cookie, sub]));
    return { statusCode: 200, body: JSON.stringify(insertId) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
