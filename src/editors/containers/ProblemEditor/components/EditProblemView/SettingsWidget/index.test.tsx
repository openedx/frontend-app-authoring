import React from 'react';

import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import { screen, initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import * as hooks from './hooks';
import { SettingsWidgetInternal as SettingsWidget } from '.';
import { initialState } from '@src/course-outline/__mocks__/courseOutlineIndex';

jest.mock('./settingsComponents/GeneralFeedback', () => 'GeneralFeedback');
jest.mock('./settingsComponents/GroupFeedback', () => 'GroupFeedback');
jest.mock('./settingsComponents/Randomization', () => 'Randomization');
jest.mock('./settingsComponents/HintsCard', () => 'HintsCard');
jest.mock('./settingsComponents/ResetCard', () => 'ResetCard');
jest.mock('./settingsComponents/ScoringCard', () => 'ScoringCard');
jest.mock('./settingsComponents/ShowAnswerCard', () => 'ShowAnswerCard');
jest.mock('./settingsComponents/SwitchEditorCard', () => 'SwitchEditorCard');
jest.mock('./settingsComponents/TimerCard', () => 'TimerCard');
jest.mock('./settingsComponents/TypeCard', () => 'TypeCard');
// NOTE: Do NOT mock useSelector here. We rely on the real hook so that
// editorRender's provided initialState flows into the component under test.
mockWaffleFlags();

describe('SettingsWidget', () => {
  const showAdvancedSettingsCardsBaseProps = {
    isAdvancedCardsVisible: false,
    showAdvancedCards: jest.fn().mockName('showAdvancedSettingsCards.showAdvancedCards'),
  };

  const props = {
    problemType: ProblemTypeKeys.TEXTINPUT,
    editorRef: { current: null},
    settings: {},
    defaultSettings: {
      maxAttempts: 2,
      showanswer: 'finished',
      showResetButton: false,
    },
    images: {},
    isLibrary: false,
    learningContextId: 'course+org+run',
    setBlockTitle: jest.fn().mockName('setBlockTitle'),
    blockTitle: '',
    updateAnswer: jest.fn().mockName('updateAnswer'),
    updateSettings: jest.fn().mockName('updateSettings'),
    updateField: jest.fn().mockName('updateField'),
    answers: [],
    correctAnswerCount: 0,
    groupFeedbackList: [],
    showMarkdownEditorButton: false,

  };

  beforeEach(() => {
    initializeMocks();
  });

  describe('behavior', () => {
    it('calls showAdvancedSettingsCards when initialized', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      editorRender(<SettingsWidget {...props} />);
      expect(hooks.showAdvancedSettingsCards).toHaveBeenCalled();
    });
  });

  describe('renders', () => {
    test('renders Settings widget page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      editorRender(<SettingsWidget {...props} />);
      expect(screen.getByText('Show advanced settings')).toBeInTheDocument();
    });

    test('renders Settings widget page advanced settings visible', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(<SettingsWidget {...props} />);
      expect(screen.queryByText('Show advanced settings')).not.toBeInTheDocument();
      expect(container.querySelector('showanswercard')).toBeInTheDocument();
      expect(container.querySelector('resetcard')).toBeInTheDocument();
    });

    test('renders Settings widget for Advanced Problem with correct widgets', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(
        <SettingsWidget {...props} problemType={ProblemTypeKeys.ADVANCED} />,
      );
      expect(container.querySelector('randomization')).toBeInTheDocument();
    });
  });
  describe('SwitchEditorCard rendering (markdown vs advanced)', () => {
    test('shows two SwitchEditorCard components when markdown is available and not currently enabled', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const modifiedInitialState: PartialEditorState = {
        problem: {
          problemType: null, // non-advanced problem
          isMarkdownEditorEnabled: false, // currently in advanced/raw (or standard) editor
          rawOLX: '<problem></problem>',
          rawMarkdown: '## Problem', // markdown content exists so button should appear
          isDirty: false,
        },
      };
      const { container } = editorRender(<SettingsWidget {...props} />, { initialState: modifiedInitialState });
      expect(container.querySelectorAll('switcheditorcard')).toHaveLength(2);
    });

    test('shows only the advanced SwitchEditorCard when already in markdown mode', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const modifiedInitialState: PartialEditorState = {
        problem: {
          problemType: null,
          isMarkdownEditorEnabled: true, // already in markdown editor, so markdown button hidden
          rawOLX: '<problem></problem>',
          rawMarkdown: '## Problem',
          isDirty: false,
        },
      };
      const { container } = editorRender(<SettingsWidget {...props} />, { initialState: modifiedInitialState });
      expect(container.querySelectorAll('switcheditorcard')).toHaveLength(1);
    });
  });

  describe('isLibrary', () => {
    const libraryProps = {
      ...props,
      isLibrary: true,
    };
    test('renders Settings widget page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      const { container } = editorRender(<SettingsWidget {...libraryProps} />);
      expect(container.querySelector('timercard')).not.toBeInTheDocument();
      expect(container.querySelector('resetcard')).not.toBeInTheDocument();
      expect(container.querySelector('typecard')).toBeInTheDocument();
      expect(container.querySelector('hintscard')).toBeInTheDocument();
      expect(screen.getByText('Show advanced settings')).toBeInTheDocument();
    });

    test('renders Settings widget page advanced settings visible', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(<SettingsWidget {...libraryProps} />);
      expect(screen.queryByText('Show advanced settings')).not.toBeInTheDocument();
      expect(container.querySelector('showanswearscard')).not.toBeInTheDocument();
      expect(container.querySelector('resetcard')).not.toBeInTheDocument();
      expect(container.querySelector('typecard')).toBeInTheDocument();
      expect(container.querySelector('hintscard')).toBeInTheDocument();
    });

    test('renders Settings widget for Advanced Problem with correct widgets', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(<SettingsWidget {...libraryProps} problemType={ProblemTypeKeys.ADVANCED} />);
      expect(container.querySelector('randomization')).toBeInTheDocument();
    });
  });
});
