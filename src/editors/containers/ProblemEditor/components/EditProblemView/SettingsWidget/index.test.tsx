import React from 'react';
import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import { screen, initializeMocks } from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import * as hooks from './hooks';
import SettingsWidget from '.';

// Mock all subcomponents so the test doesn’t depend on Redux hooks inside them
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
mockWaffleFlags();

jest.mock('@src/editors/data/redux', () => {
  const actualRedux = jest.requireActual('@src/editors/data/redux');
  return {
    ...actualRedux,
    selectors: {
      ...actualRedux.selectors,
      problem: {
        ...actualRedux.selectors.problem,
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
        ...actualRedux.selectors.app,
        blockTitle: jest.fn(() => 'Sample Block Title'),
        images: jest.fn(() => ({})),
        isLibrary: jest.fn(() => false),
        learningContextId: jest.fn(() => 'course+org+run'),
        isMarkdownEditorEnabledForCourse: jest.fn(() => true),
      },
    },
    actions: {
      ...actualRedux.actions,
      app: {
        ...actualRedux.actions.app,
        setBlockTitle: jest.fn(() => ({ type: 'MOCK_SET_BLOCK_TITLE' })),
      },
      problem: {
        ...actualRedux.actions.problem,
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
    showAdvancedCards: jest.fn(),
    setResetTrue: jest.fn(),
  };

  const props = { problemType: ProblemTypeKeys.TEXTINPUT };

  beforeEach(() => {
    initializeMocks();
  });

  describe('behavior', () => {
    it('calls showAdvancedSettingsCards when initialized', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      editorRender(<SettingsWidget {...props} />, { initialState: {} });
      expect(hooks.showAdvancedSettingsCards).toHaveBeenCalled();
    });
  });

  describe('renders', () => {
    test('renders Settings widget page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      editorRender(<SettingsWidget {...props} />);
      expect(screen.getByText('Show advanced settings')).toBeInTheDocument();
    });

    test('renders advanced settings visible', () => {
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

    test('renders advanced problem with correct widgets', () => {
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

  describe('isLibrary', () => {
    const libraryProps = { ...props, isLibrary: true };

    test('renders library settings page', () => {
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsBaseProps);
      const { container } = editorRender(<SettingsWidget {...libraryProps} />);
      expect(container.querySelector('timercard')).not.toBeInTheDocument();
      expect(container.querySelector('resetcard')).not.toBeInTheDocument();
      expect(container.querySelector('typecard')).toBeInTheDocument();
      expect(container.querySelector('hintscard')).toBeInTheDocument();
      expect(screen.getByText('Show advanced settings')).toBeInTheDocument();
    });

    test('renders library advanced settings visible', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(<SettingsWidget {...libraryProps} />);
      expect(screen.queryByText('Show advanced settings')).not.toBeInTheDocument();
      expect(container.querySelector('showanswearscard')).not.toBeInTheDocument();
      expect(container.querySelector('typecard')).toBeInTheDocument();
      expect(container.querySelector('hintscard')).toBeInTheDocument();
    });

    test('renders advanced problem for library', () => {
      const showAdvancedSettingsCardsProps = {
        ...showAdvancedSettingsCardsBaseProps,
        isAdvancedCardsVisible: true,
      };
      jest.spyOn(hooks, 'showAdvancedSettingsCards').mockReturnValue(showAdvancedSettingsCardsProps);
      const { container } = editorRender(
        <SettingsWidget {...libraryProps} problemType={ProblemTypeKeys.ADVANCED} />,
      );
      expect(container.querySelector('randomization')).toBeInTheDocument();
    });
  });
});
