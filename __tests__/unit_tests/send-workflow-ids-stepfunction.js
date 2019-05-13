import AWS from 'aws-sdk';
import log from '@kevinwang0316/log';

import sendWorkflowIds from '../../functions/libs/send-workflow-ids-stepfunction';

require('../helpers/initailEnvsForUnitTest');

const mockStartExecution = jest.fn();
const mockStepFunction = { startExecution: mockStartExecution };

jest.mock('aws-sdk', () => ({
  config: { update: jest.fn() },
  StepFunctions: jest.fn().mockImplementation(() => mockStepFunction),
}));

describe('send-workflow-ids-stepfunction', () => {
  beforeEach(() => jest.clearAllMocks());

  test('sendWorkflowIds -> workflows equal zero without error', async () => {
    const workflows = [];
    const keys = { key1: 1, key2: 2 };

    await sendWorkflowIds(workflows, keys);

    expect(mockStartExecution).not.toHaveBeenCalled();
  });
});
