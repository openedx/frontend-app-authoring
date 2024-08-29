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

describe('Problem settings hooks', () => {
  let output;
  let updateSettings;
  let generalFeedback;
  beforeEach(() => {
    updateSettings = jest.fn();
    generalFeedback = 'sOmE_vAlUe';
    state.mock();
  });
  afterEach(() => {
    state.restore();
    useEffect.mockClear();
  });
  describe('Show advanced settings', () => {
    beforeEach(() => {
      output = hooks.generalFeedbackHooks(generalFeedback, updateSettings);
    });
    test('test default state is false', () => {
      expect(output.summary.message).toEqual(messages.noGeneralFeedbackSummary);
    });
    test('test showAdvancedCards sets state to true', () => {
      const mockEvent = { target: { value: 'sOmE_otheR_ValUe' } };
      output.handleChange(mockEvent);
      expect(updateSettings).toHaveBeenCalledWith({ generalFeedback: mockEvent.target.value });
    });
  });
});
