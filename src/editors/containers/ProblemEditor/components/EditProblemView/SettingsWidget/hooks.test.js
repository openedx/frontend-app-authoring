import { useEffect } from 'react';
import { MockUseState } from '../../../../../../testUtils';
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

jest.mock('../../../../../data/redux', () => ({
  actions: {
    problem: {
      updateSettings: (args) => ({ updateSettings: args }),
      updateField: (args) => ({ updateField: args }),
      updateAnswer: (args) => ({ updateAnswer: args }),
    },
  },
}));

const state = new MockUseState(hooks);

describe('Problem settings hooks', () => {
  let output;
  let updateSettings;
  beforeEach(() => {
    updateSettings = jest.fn();
    state.mock();
  });
  afterEach(() => {
    state.restore();
    useEffect.mockClear();
  });
  describe('Show advanced settings', () => {
    beforeEach(() => {
      output = hooks.showAdvancedSettingsCards();
    });
    test('test default state is false', () => {
      expect(output.isAdvancedCardsVisible).toBeFalsy();
    });
    test('test showAdvancedCards sets state to true', () => {
      output.showAdvancedCards();
      expect(state.setState[state.keys.showAdvanced]).toHaveBeenCalledWith(true);
    });
  });
  describe('Show full card', () => {
    beforeEach(() => {
      output = hooks.showFullCard();
    });
    test('test default state is false', () => {
      expect(output.isCardCollapsed).toBeFalsy();
    });
    test('test toggleCardCollapse to true', () => {
      output.toggleCardCollapse();
      expect(state.setState[state.keys.cardCollapsed]).toHaveBeenCalledWith(true);
    });
  });

  describe('Hint card hooks', () => {
    test('test useEffect triggers set hints summary no hint', () => {
      const hints = [];
      hooks.hintsCardHooks(hints, updateSettings);
      expect(state.setState[state.keys.summary]).not.toHaveBeenCalled();
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual([[]]);
      cb();
      expect(state.setState[state.keys.summary])
        .toHaveBeenCalledWith({ message: messages.noHintSummary, values: {} });
    });
    test('test useEffect triggers set hints summary', () => {
      const hints = [{ id: 1, value: 'hint1' }];
      output = hooks.hintsCardHooks(hints, updateSettings);
      expect(state.setState[state.keys.summary]).not.toHaveBeenCalled();
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual([[{ id: 1, value: 'hint1' }]]);
      cb();
      expect(state.setState[state.keys.summary])
        .toHaveBeenCalledWith({
          message: messages.hintSummary,
          values: { hint: hints[0].value, count: (hints.length - 1) },
        });
    });
    test('test handleAdd triggers updateSettings', () => {
      const hint1 = { id: 1, value: 'hint1' };
      const hint2 = { id: 2, value: '' };
      const hints = [hint1];
      output = hooks.hintsCardHooks(hints, updateSettings);
      output.handleAdd();
      expect(updateSettings).toHaveBeenCalledWith({ hints: [hint1, hint2] });
    });
  });
  describe('Hint rows hooks', () => {
    const hint1 = { id: 1, value: 'hint1' };
    const hint2 = { id: 2, value: '' };
    const value = 'modifiedHint';
    const modifiedHint = { id: 2, value };
    const hints = [hint1, hint2];
    beforeEach(() => {
      output = hooks.hintsRowHooks(2, hints, updateSettings);
    });
    test('test handleChange', () => {
      output.handleChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ hints: [hint1, modifiedHint] });
    });
    test('test handleDelete', () => {
      output.handleDelete();
      expect(updateSettings).toHaveBeenCalledWith({ hints: [hint1] });
    });
    test('test handleEmptyHint', () => {
      output.handleEmptyHint({ target: { value: '' } });
      expect(updateSettings).toHaveBeenCalledWith({ hints: [hint1] });
    });
  });

  describe('Matlab card hooks', () => {
    test('test useEffect triggers set summary', () => {
      const apiKey = 'matlab_api_key';
      hooks.matlabCardHooks(apiKey, updateSettings);
      expect(state.setState[state.keys.summary]).not.toHaveBeenCalled();
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual([apiKey]);
      cb();
      expect(state.setState[state.keys.summary])
        .toHaveBeenCalledWith({ message: apiKey, values: {}, intl: false });
    });
    test('test useEffect triggers set summary no key', () => {
      hooks.matlabCardHooks('', updateSettings);
      expect(state.setState[state.keys.summary]).not.toHaveBeenCalled();
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual(['']);
      cb();
      expect(state.setState[state.keys.summary])
        .toHaveBeenCalledWith({ message: messages.matlabNoKeySummary, values: {}, intl: true });
    });
    test('test handleChange', () => {
      const apiKey = 'matlab_api_key';
      const value = 'new_matlab_api_key';
      output = hooks.matlabCardHooks(apiKey, updateSettings);
      output.handleChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ matLabApiKey: value });
    });
  });

  describe('Reset card hooks', () => {
    beforeEach(() => {
      output = hooks.resetCardHooks(updateSettings);
    });
    test('test setResetTrue', () => {
      output.setResetTrue();
      expect(updateSettings).toHaveBeenCalledWith({ showResetButton: true });
    });
    test('test setResetFalse', () => {
      output.setResetFalse();
      expect(updateSettings).toHaveBeenCalledWith({ showResetButton: false });
    });
  });

  describe('Scoring card hooks', () => {
    const scoring = {
      weight: 1.5,
      attempts: {
        unlimited: false,
        number: 5,
      },
    };
    beforeEach(() => {
      output = hooks.scoringCardHooks(scoring, updateSettings);
    });
    test('test handleMaxAttemptChange', () => {
      const value = 6;
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: value, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to zero', () => {
      const value = 0;
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: value, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to null value', () => {
      const value = null;
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: true } } });
    });
    test('test handleMaxAttemptChange set attempts to empty string', () => {
      const value = '';
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: true } } });
    });
    test('test handleMaxAttemptChange set attempts to non-numeric value', () => {
      const value = 'abc';
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: true } } });
    });
    test('test handleMaxAttemptChange set attempts to negative value', () => {
      const value = -1;
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: 0, unlimited: false } } });
    });
    test('test handleWeightChange', () => {
      const value = 2;
      output.handleWeightChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ scoring: { ...scoring, weight: parseFloat(value) } });
    });
  });

  describe('Show answer card hooks', () => {
    const showAnswer = {
      on: 'after_attempts',
      afterAttempts: 5,
    };
    beforeEach(() => {
      output = hooks.showAnswerCardHooks(showAnswer, updateSettings);
    });
    test('test handleShowAnswerChange', () => {
      const value = 'always';
      output.handleShowAnswerChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ showAnswer: { ...showAnswer, on: value } });
    });
    test('test handleAttemptsChange', () => {
      const value = 3;
      output.handleAttemptsChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ showAnswer: { ...showAnswer, afterAttempts: parseInt(value) } });
    });
  });

  describe('Timer card hooks', () => {
    test('test handleChange', () => {
      output = hooks.timerCardHooks(updateSettings);
      const value = 5;
      output.handleChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ timeBetween: value });
    });
  });

  describe('Type row hooks', () => {
    test('test onClick', () => {
      const typekey = 'multiplechoiceresponse';
      const updateField = jest.fn();
      const updateAnswer = jest.fn();
      const answers = [{
        correct: true,
        id: 'a',
      },
      {
        correct: true,
        id: 'b',
      }];
      output = hooks.typeRowHooks({
        answers,
        correctAnswerCount: 2,
        typeKey: typekey,
        updateField,
        updateAnswer,
      });
      output.onClick();
      expect(updateAnswer).toHaveBeenNthCalledWith(1, { ...answers[0], correct: false });
      expect(updateAnswer).toHaveBeenNthCalledWith(2, { ...answers[1], correct: false });
      expect(updateField).toHaveBeenCalledWith({ problemType: typekey });
    });
  });
  describe('Type row hooks', () => {
    test('test onClick', () => {
      const switchToAdvancedEditor = jest.fn();
      const setConfirmOpen = jest.fn();
      window.scrollTo = jest.fn();
      hooks.confirmSwitchToAdvancedEditor({
        switchToAdvancedEditor,
        setConfirmOpen,
      });
      expect(switchToAdvancedEditor).toHaveBeenCalled();
      expect(setConfirmOpen).toHaveBeenCalledWith(false);
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });
});
