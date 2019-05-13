import log from '@kevinwang0316/log';

require('../helpers/initailEnvsForUnitTest');

let sendWorkflowIds;
const mockPromise = jest.fn();
const mockStartExecution = jest.fn().mockReturnValue({ promise: mockPromise });

// Use doMock to defer the mock due to we need to
// set StepFunctions' method to a out scope mock variable
jest.doMock('aws-sdk', () => ({
  config: { update: jest.fn() },
  StepFunctions: jest.fn().mockImplementation(() => ({ startExecution: mockStartExecution })),
}));
jest.mock('@kevinwang0316/log', () => ({
  error: jest.fn(),
}));

describe('send-workflow-ids-stepfunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Import the file here to avoid the AWS functions get call before it get mock
    sendWorkflowIds = require('../../functions/libs/send-workflow-ids-stepfunction');
  });

  test('sendWorkflowIds -> workflows equal zero without error', async () => {
    const workflows = [];
    const keys = { key1: 1, key2: 2 };

    await sendWorkflowIds(workflows, keys);

    expect(mockStartExecution).not.toHaveBeenCalled();
    expect(mockPromise).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });

  test('sendWorkflowIds -> workflows less than bath size without error', async () => {
    const workflows = [
      ['workflow 00', null, null, null, null, null, null, null, null, null, null, null, null, 'workflow 013'],
      ['workflow 10', null, null, null, null, null, null, null, null, null, null, null, null, 'workflow 113'],
    ];
    const extraWorkflows = [...workflows];
    const keys = { key1: 1, key2: 2 };

    await sendWorkflowIds(workflows, keys);

    expect(mockStartExecution).toHaveBeenCalledTimes(1);
    expect(mockStartExecution).toHaveBeenLastCalledWith({
      stateMachineArn: process.env.FETCH_HEALTH_SCORE_SF,
      input: JSON.stringify({
        keys,
        ids: [[extraWorkflows[0][13], extraWorkflows[0][0]], [extraWorkflows[1][13], extraWorkflows[1][0]]],
        waitTime: process.env.MESSAGE_DELAY_SECOND * 0,
      }),
    });
    expect(mockPromise).toHaveBeenCalledTimes(1);
    expect(log.error).not.toHaveBeenCalled();
  });
});
