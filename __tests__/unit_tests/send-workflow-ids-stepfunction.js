import AWS from 'asw-sdk';
import log from '@kevinwang0316/log';

require('../helpers/initailEnvsForUnitTest');

const mockStepFunction = jest.fn();

jest.mock('aws-sdk', () => ({
  config: { update: jest.fn() },
  StepFunctions: jest.fn().mockImplementation(() => mockStepFunction),
}));

describe('send-workflow-ids-stepfunction', () => {
  beforeEach(() => jest.clearAllMocks());

  test('sendWorkflowIds without error', () => {

  });
});
