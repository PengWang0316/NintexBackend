import { error } from '@kevinwang0316/log';
import { trackExecTime } from '@kevinwang0316/cloudwatch';
import { queryAsync } from '@kevinwang0316/mysql-helper';

import sendToStepfunction from '../../functions/libs/send-workflow-ids-stepfunction';

import { handler } from '../../functions/add-nwc-workflows';

require('../helpers/initailEnvsForUnitTest');

jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('@kevinwang0316/cloudwatch', () => ({ trackExecTime: jest.fn().mockImplementation((string, fn) => fn()) }));
jest.mock('@kevinwang0316/mysql-helper', () => ({ queryAsync: jest.fn() }));
jest.mock('../../functions/libs/send-workflow-ids-stepfunction', () => jest.fn().mockResolvedValue(true));
jest.mock('../../middlewares/wrapper', () => jest.fn().mockImplementation(func => func));

const QUERY_SQL = 'INSERT INTO ?? (id, isPublished, name, authorName, authorId, authorEmail, created, eventConfiguration, eventType, isActive, lastPublished, publishedType, publishedId, tenantUrl, description) VALUES ?';

describe('add-nwc-workflows', () => {
  beforeEach(() => jest.clearAllMocks());

  test('run handler -> without error', async () => {
    const event = { body: JSON.stringify({ workflows: 'workflows', keys: 'keys' }) };
    const context = { functionName: 'functionName' };

    const result = await handler(event, context);

    expect(trackExecTime).toHaveBeenCalledTimes(1);
    expect(queryAsync).toHaveBeenCalledTimes(1);
    expect(queryAsync).toHaveBeenLastCalledWith(QUERY_SQL, [process.env.NWCWORKFLOW_TABLE, 'workflows']);
    expect(sendToStepfunction).toHaveBeenCalledTimes(1);
    expect(sendToStepfunction).toHaveBeenLastCalledWith('workflows', 'keys');
    expect(error).not.toHaveBeenCalled();
    expect(result).toEqual({ statusCode: 200 });
  });

  test('run handler -> with error', async () => {
    const event = { body: JSON.stringify({ workflows: 'workflows', keys: 'keys' }) };
    const context = { functionName: 'functionName' };

    trackExecTime.mockRejectedValueOnce('error');

    const result = await handler(event, context);

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenLastCalledWith(`${context.functionName}: error`);
    expect(result).toEqual({ statusCode: 500 });
  });
});
