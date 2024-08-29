import { useEffect } from 'react';
import { MockUseState } from '../../../../../../../testUtils';
import messages from './messages';
import * as hooks from './hooks';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    updateState,
    useEffect: jest.fn(),
    useState: jest.fn(val => ([{ state: val }, (newVal) => updateState({ val, newVal })])),
  };
});

jest.mock('@edx/frontend-platform/i18n', () => ({
  defineMessages: m => m,
}));

const state = new MockUseState(hooks);

describe('groupFeedbackCardHooks', () => {
  let output;
  let updateSettings;
  let groupFeedbacks;
  beforeEach(() => {
    updateSettings = jest.fn();
    groupFeedbacks = [];
    state.mock();
  });
  afterEach(() => {
    state.restore();
    useEffect.mockClear();
  });
  describe('Show advanced settings', () => {
    beforeEach(() => {
      output = hooks.groupFeedbackCardHooks(groupFeedbacks, updateSettings);
    });
    test('test default state is false', () => {
      expect(output.summary.message).toEqual(messages.noGroupFeedbackSummary);
    });
    test('test Event adds a new feedback ', () => {
      output.handleAdd();
      expect(updateSettings).toHaveBeenCalledWith({ groupFeedbackList: [{ id: 0, answers: [], feedback: '' }] });
    });
  });
});

describe('groupFeedbackRowHooks', () => {
  const mockId = 'iD';
  const mockAnswer = 'moCkAnsweR';
  const mockFeedback = 'mOckFEEdback';
  let groupFeedbacks;
  let output;
  let updateSettings;

  beforeEach(() => {
    updateSettings = jest.fn();
    groupFeedbacks = [{ id: mockId, answers: [mockAnswer], feedback: mockFeedback }];
    state.mock();
  });
  afterEach(() => {
    state.restore();
    useEffect.mockClear();
  });
  describe('Show advanced settings', () => {
    beforeEach(() => {
      output = hooks.groupFeedbackRowHooks({ id: mockId, groupFeedbacks, updateSettings });
    });
    test('test associate an answer with the feedback object', () => {
      const mockNewAnswer = 'nEw VAluE';
      output.handleAnswersSelectedChange({ target: { checked: true, value: mockNewAnswer } });
      expect(updateSettings).toHaveBeenCalledWith(
        { groupFeedbackList: [{ id: mockId, answers: [mockAnswer, mockNewAnswer], feedback: mockFeedback }] },
      );
    });
    test('test unassociate an answer with the feedback object', () => {
      output.handleAnswersSelectedChange({ target: { checked: false, value: mockAnswer } });
      expect(updateSettings).toHaveBeenCalledWith(
        { groupFeedbackList: [{ id: mockId, answers: [], feedback: mockFeedback }] },
      );
    });
    test('test update feedback text with a groupfeedback', () => {
      const mockNewFeedback = 'nEw fEedBack';
      output.handleFeedbackChange({ target: { checked: false, value: mockNewFeedback } });
      expect(updateSettings).toHaveBeenCalledWith(
        { groupFeedbackList: [{ id: mockId, answers: [mockAnswer], feedback: mockNewFeedback }] },
      );
    });
    test('Delete a Row from the list of feedbacks', () => {
      output.handleDelete();
      expect(updateSettings).toHaveBeenCalledWith(
        { groupFeedbackList: [] },
      );
    });
  });
});
