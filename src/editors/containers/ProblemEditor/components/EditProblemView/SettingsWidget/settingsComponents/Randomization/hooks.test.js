import { useEffect } from 'react';
import { MockUseState } from '../../../../../../../../testUtils';
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

const state = new MockUseState(hooks);

describe('Problem settings hooks', () => {
  let output;
  let updateSettings;
  let randomization;
  beforeEach(() => {
    updateSettings = jest.fn();
    randomization = 'sOmE_vAlUe';
    state.mock();
  });
  afterEach(() => {
    state.restore();
    useEffect.mockClear();
  });
  describe('Show advanced settings', () => {
    beforeEach(() => {
      output = hooks.useRandomizationSettingStatus({ randomization, updateSettings });
    });
    test('test default state is false', () => {
      expect(output.summary).toEqual({ message: messages.noRandomizationSummary, values: {} });
    });
    test('test showAdvancedCards sets state to true', () => {
      const mockEvent = { target: { value: 'sOmE_otheR_ValUe' } };
      output.handleChange(mockEvent);
      expect(updateSettings).toHaveBeenCalledWith({ randomization: mockEvent.target.value });
    });
  });
});
