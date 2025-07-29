import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import editorRender, { type PartialEditorState } from '@src/editors/editorTestRender';
import * as hooks from './hooks';
import { SettingsWidgetInternal as SettingsWidget } from '.';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';

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

const initialState: PartialEditorState = {
  problem: {
    groupFeedbackList: [], // <-- not a function
    settings: {
      hints: [],
      scoring: {
        weight: 1,
        attempts: {
          unlimited: false,
          number: 2,
        },
      },
      showAnswer: { on: 'finished' },
      showResetButton: false,
      randomization: 'always' as any,
      tolerance: { value: 0.1, type: 'Number' },
      timeBetween: 0,
    },
    answers: [],
    correctAnswerCount: 0,
    defaultSettings: {
      maxAttempts: { value: 2 },
      showanswer: 'finished',
      showResetButton: false,
      rerandomize: 'always',
    } as Record<string, any>,
    rawMarkdown: '## Sample markdown',
  },
  app: {
    blockTitle: 'Sample Block Title',
    images: {},
    learningContextId: 'course+org+run',
    isMarkdownEditorEnabledForCourse: true,
  },
};
jest.mock('../../../../../data/redux', () => {
  const originalModule = jest.requireActual('../../../../../data/redux');
  return {
    ...originalModule,
    actions: {
      app: {
        setBlockTitle: jest.fn(() => ({ type: 'MOCK_SET_BLOCK_TITLE' })),
      },
      problem: {
        updateSettings: jest.fn(() => ({ type: 'MOCK_UPDATE_SETTINGS' })),
        updateField: jest.fn(() => ({ type: 'MOCK_UPDATE_FIELD' })),
        updateAnswer: jest.fn(() => ({ type: 'MOCK_UPDATE_ANSWER' })),
      },
    },
  };
});

describe('SettingsWidget', () => {
  const showAdvancedSettingsCardsBaseProps = {
    isAdvancedCardsVisible: false,
    showAdvancedCards: jest.fn().mockName('showAdvancedSettingsCards.showAdvancedCards'),
    setResetTrue: jest.fn().mockName('showAdvancedSettingsCards.setResetTrue'),
  };

  const props = {
    problemType: ProblemTypeKeys.TEXTINPUT,
  };

  beforeEach(() => {
    initializeMocks();
  });

  describe('behavior', () => {
    it('calls showAdvancedSettingsCards when initialized', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      editorRender(<SettingsWidget {...props} />, { initialState });
      expect(hooks.showAdvancedSettingsCards).toHaveBeenCalled();
    });
  });

  describe('renders', () => {
    test('renders Settings widget page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      editorRender(<SettingsWidget {...props} />, { initialState });
      expect(screen.getByText('Show advanced settings')).toBeInTheDocument();
    });

    test('renders Settings widget page advanced settings visible', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(<SettingsWidget {...props} />, { initialState });
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
      const { container } = editorRender(<SettingsWidget
        {...props}
        problemType={ProblemTypeKeys.ADVANCED}
      />, { initialState });

      expect(container.querySelector('randomization')).toBeInTheDocument();
    });
  });

  describe('isLibrary', () => {
    const libraryProps = {
      ...props,
      isLibrary: true,
    };
    test('renders Settings widget page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      const { container } = editorRender(<SettingsWidget {...libraryProps} />, { initialState });
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
      const { container } = editorRender(<SettingsWidget {...libraryProps} />, { initialState });
      expect(screen.queryByText('Show advanced settings')).not.toBeInTheDocument();
      expect(container.querySelector('showanswearscard')).not.toBeInTheDocument();
      expect(container.querySelector('typecard')).toBeInTheDocument();
      expect(container.querySelector('hintscard')).toBeInTheDocument();
    });

    test('renders Settings widget for Advanced Problem with correct widgets', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(
        <SettingsWidget {...libraryProps} problemType={ProblemTypeKeys.ADVANCED} />,
        { initialState },
      );
      expect(container.querySelector('randomization')).toBeInTheDocument();
    });
  });
});
