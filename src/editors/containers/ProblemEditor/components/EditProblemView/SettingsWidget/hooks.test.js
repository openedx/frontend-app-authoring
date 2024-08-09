import { useEffect } from 'react';
import { MockUseState } from '../../../../../testUtils';
import messages from './messages';
import { keyStore } from '../../../../../utils';
import * as hooks from './hooks';
import { ProblemTypeKeys, ProblemTypes } from '../../../../../data/constants/problem';
import * as editHooks from '../hooks';

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
const moduleKeys = keyStore(editHooks);

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
      expect(output.isCardCollapsibleOpen).toBeFalsy();
    });
    test('test toggleCardCollapse to true', () => {
      output.toggleCardCollapse();
      expect(state.setState[state.keys.cardCollapsed]).toHaveBeenCalledWith(true);
    });
    test('test toggleCardCollapse to true', () => {
      output = hooks.showFullCard(true);
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
      output.handleChange(value);
      expect(updateSettings).toHaveBeenCalledWith({ hints: [hint1, modifiedHint] });
    });
    test('test handleDelete', () => {
      output.handleDelete();
      expect(updateSettings).toHaveBeenCalledWith({ hints: [hint1] });
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
    const defaultValue = 1;
    test('test scoringCardHooks initializes display value when attempts.number is null', () => {
      const nilScoring = { ...scoring, attempts: { unlimited: false, number: null } };
      output = hooks.scoringCardHooks(nilScoring, updateSettings, defaultValue);
      expect(state.stateVals[state.keys.attemptDisplayValue]).toEqual(`${defaultValue} (Default)`);
    });
    test('test scoringCardHooks initializes display value when attempts.number is blank', () => {
      const nilScoring = { ...scoring, attempts: { unlimited: false, number: '' } };
      output = hooks.scoringCardHooks(nilScoring, updateSettings, defaultValue);
      expect(state.stateVals[state.keys.attemptDisplayValue]).toEqual(`${defaultValue} (Default)`);
    });
    test('test scoringCardHooks initializes display value when attempts.number is not null', () => {
      const nonNilScoring = { ...scoring, attempts: { unlimited: false, number: 2 } };
      output = hooks.scoringCardHooks(nonNilScoring, updateSettings, defaultValue);
      expect(state.stateVals[state.keys.attemptDisplayValue]).toEqual(2);
    });
    test('test scoringCardHooks initializes display value when attempts.number and defaultValue is null', () => {
      const nonNilScoring = { ...scoring, attempts: { unlimited: false, number: null } };
      output = hooks.scoringCardHooks(nonNilScoring, updateSettings, null);
      expect(state.stateVals[state.keys.attemptDisplayValue]).toEqual('');
    });
    beforeEach(() => {
      output = hooks.scoringCardHooks(scoring, updateSettings, defaultValue);
    });
    test('test handleUnlimitedChange sets attempts.unlimited to true when checked', () => {
      output.handleUnlimitedChange({ target: { checked: true } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith('');
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: true } } });
    });
    test('test handleUnlimitedChange sets attempts.unlimited to false when unchecked', () => {
      output.handleUnlimitedChange({ target: { checked: false } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: false } } });
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
    test('test handleMaxAttemptChange set attempts to null value when default max_attempts is present', () => {
      const value = null;
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to null when default value is inputted', () => {
      const value = '1 (Default)';
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to non-numeric value', () => {
      const value = 'abc';
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to empty value', () => {
      const value = '';
      output.handleMaxAttemptChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith(`${defaultValue} (Default)`);
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to negative value', () => {
      const value = -1;
      output.handleMaxAttemptChange({ target: { value } });
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: 0, unlimited: false } } });
    });
    test('test handleMaxAttemptChange set attempts to empty value with no default', () => {
      const value = '';
      output = hooks.scoringCardHooks(scoring, updateSettings, null);
      output.handleMaxAttemptChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith('');
      expect(updateSettings)
        .toHaveBeenCalledWith({ scoring: { ...scoring, attempts: { number: null, unlimited: true } } });
    });
    test('test handleOnChange', () => {
      const value = 6;
      output.handleOnChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith(value);
    });
    test('test handleOnChange set attempts to zero', () => {
      const value = 0;
      output.handleOnChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith(value);
    });
    test('test handleOnChange set attempts to default value from empty string', () => {
      const value = '';
      output.handleOnChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith('');
    });
    test('test handleOnChange set attempts to default value', () => {
      const value = 1;
      output.handleOnChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith('1 (Default)');
    });
    test('test handleOnChange set attempts to non-numeric value', () => {
      const value = '';
      output.handleOnChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith(value);
    });
    test('test handleOnChange set attempts to negative value', () => {
      const value = -1;
      output.handleOnChange({ target: { value } });
      expect(state.setState[state.keys.attemptDisplayValue]).toHaveBeenCalledWith(0);
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
      output = hooks.useAnswerSettings(showAnswer, updateSettings);
    });
    test('test handleShowAnswerChange', () => {
      const value = 'always';
      output.handleShowAnswerChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({ showAnswer: { ...showAnswer, on: value } });
    });
    test('test handleAttemptsChange', () => {
      const value = 3;
      output.handleAttemptsChange({ target: { value } });
      expect(updateSettings).toHaveBeenCalledWith({
        showAnswer: { ...showAnswer, afterAttempts: parseInt(value, 10) },
      });
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
    const typeRowProps = {
      problemType: ProblemTypeKeys.MULTISELECT,
      typeKey: ProblemTypeKeys.DROPDOWN,
      blockTitle: ProblemTypes[ProblemTypeKeys.MULTISELECT].title,
      setBlockTitle: jest.fn(),
      updateField: jest.fn(),
      updateAnswer: jest.fn(),
      correctAnswerCount: 2,
      answers: [
        { correct: true, id: 'a', title: '<p>testA</p>' },
        { correct: true, id: 'b', title: '<p>testB</p>' },
        { correct: false, id: 'c', title: '<p>testC</p>' },
      ],
    };
    const fetchEditorContent = () => ({
      answers: {
        a: 'testA',
        b: 'testB',
        c: 'testC',
      },
    });
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(editHooks, moduleKeys.fetchEditorContent)
        .mockImplementationOnce(fetchEditorContent);
    });
    test('test onClick Multi-select to Dropdown', () => {
      output = hooks.typeRowHooks(typeRowProps);
      output.onClick();
      expect(typeRowProps.setBlockTitle).toHaveBeenCalledWith(ProblemTypes[ProblemTypeKeys.DROPDOWN].title);
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(1, { ...typeRowProps.answers[0], correct: false, title: 'testA' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(2, { ...typeRowProps.answers[1], correct: false, title: 'testB' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(3, { ...typeRowProps.answers[2], correct: false, title: 'testC' });
      expect(typeRowProps.updateField).toHaveBeenCalledWith({ problemType: ProblemTypeKeys.DROPDOWN });
    });

    test('test onClick Multi-select to Dropdown with one correct answer', () => {
      const oneAnswerTypeRowProps = {
        ...typeRowProps,
        correctAnswerCount: 1,
        answers: [
          { correct: true, id: 'a', title: '<p>testA</p>' },
          { correct: false, id: 'b', title: '<p>testB</p>' },
          { correct: false, id: 'c', title: '<p>testC</p>' },
        ],
      };
      output = hooks.typeRowHooks(oneAnswerTypeRowProps);
      output.onClick();
      expect(typeRowProps.setBlockTitle).toHaveBeenCalledWith(ProblemTypes[ProblemTypeKeys.DROPDOWN].title);
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(1, { ...oneAnswerTypeRowProps.answers[0], title: 'testA' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(2, { ...oneAnswerTypeRowProps.answers[1], title: 'testB' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(3, { ...oneAnswerTypeRowProps.answers[2], title: 'testC' });
      expect(typeRowProps.updateField).toHaveBeenCalledWith({ problemType: ProblemTypeKeys.DROPDOWN });
    });
    test('test onClick Multi-select to Numeric', () => {
      output = hooks.typeRowHooks({
        ...typeRowProps,
        typeKey: ProblemTypeKeys.NUMERIC,
      });
      output.onClick();
      expect(typeRowProps.setBlockTitle).toHaveBeenCalledWith(ProblemTypes[ProblemTypeKeys.NUMERIC].title);
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(1, { ...typeRowProps.answers[0], correct: true, title: 'testA' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(2, { ...typeRowProps.answers[1], correct: true, title: 'testB' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(3, { ...typeRowProps.answers[2], correct: true, title: 'testC' });
      expect(typeRowProps.updateField).toHaveBeenCalledWith({ problemType: ProblemTypeKeys.NUMERIC });
    });

    test('test onClick Multi-select to Text Input', () => {
      output = hooks.typeRowHooks({
        ...typeRowProps,
        typeKey: ProblemTypeKeys.TEXTINPUT,
      });
      output.onClick();
      expect(typeRowProps.setBlockTitle).toHaveBeenCalledWith(ProblemTypes[ProblemTypeKeys.TEXTINPUT].title);
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(1, { ...typeRowProps.answers[0], title: 'testA' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(2, { ...typeRowProps.answers[1], title: 'testB' });
      expect(typeRowProps.updateAnswer).toHaveBeenNthCalledWith(3, { ...typeRowProps.answers[2], title: 'testC' });
      expect(typeRowProps.updateField).toHaveBeenCalledWith({ problemType: ProblemTypeKeys.TEXTINPUT });
    });
  });
  test('test confirmSwitchToAdvancedEditor hook', () => {
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
