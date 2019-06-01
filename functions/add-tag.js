const log = require('@kevinwang0316/log');
const { trackExecTime } = require('@kevinwang0316/cloudwatch');
const { queryAsync } = require('@kevinwang0316/mysql-helper');

const wrapper = require('../middlewares/wrapper');

const INSERT_SQL = 'INSERT INTO ?? (content, color, userId) VALUES (?, ?, ?)';
const COLOR_REGEXP = /^#[\d\w]{6}$/;

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { sub } } } } = event;
  const { content, color } = JSON.parse(event.body);

  // Do the input validation
  if (!content || !color || content === '' || !color.match(COLOR_REGEXP)) return { statusCode: 500 };
  try {
    const { rows: { insertId } } = await trackExecTime('MySQL Insert Latency', () => queryAsync(INSERT_SQL, [process.env.TAGS_TABLE, content, color, sub]));
    return { statusCode: 200, body: JSON.stringify(insertId) };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
