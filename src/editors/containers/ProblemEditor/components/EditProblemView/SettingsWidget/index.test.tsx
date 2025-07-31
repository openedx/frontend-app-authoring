import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
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

jest.mock('../../../../../data/redux', () => ({
  selectors: {
    problem: {
      groupFeedbackList: jest.fn(() => []),
      settings: jest.fn(() => ({
        hints: [],
        scoring: 'default',
        showAnswer: 'finished',
        showResetButton: false,
        randomization: 'always',
        tolerance: 0.1,
        timeBetween: 0,
      })),
      answers: jest.fn(() => []),
      correctAnswerCount: jest.fn(() => 0),
      defaultSettings: jest.fn(() => ({
        maxAttempts: 2,
        showanswer: 'finished',
        showResetButton: false,
        rerandomize: 'always',
      })),
      rawMarkdown: jest.fn(() => '## Sample markdown'),
    },
    app: {
      blockTitle: jest.fn(() => 'Sample Block Title'),
      images: jest.fn(() => ({})),
      isLibrary: jest.fn(() => false),
      learningContextId: jest.fn(() => 'course+org+run'),
      isMarkdownEditorEnabledForCourse: jest.fn(() => true),
    },
  },
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
}));

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
      render(<SettingsWidget {...props} />);
      expect(hooks.showAdvancedSettingsCards).toHaveBeenCalled();
    });
  });

  describe('renders', () => {
    test('renders Settings widget page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      render(<SettingsWidget {...props} />);
      expect(screen.getByText('Show advanced settings')).toBeInTheDocument();
    });

    test('renders Settings widget page advanced settings visible', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = render(<SettingsWidget {...props} />);
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
      const { container } = render(
        <SettingsWidget {...props} problemType={ProblemTypeKeys.ADVANCED} />,
      );
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
      const { container } = render(<SettingsWidget {...libraryProps} />);
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
      const { container } = render(<SettingsWidget {...libraryProps} />);
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
      const { container } = render(<SettingsWidget {...libraryProps} problemType={ProblemTypeKeys.ADVANCED} />);
      expect(container.querySelector('randomization')).toBeInTheDocument();
    });
  });
});
