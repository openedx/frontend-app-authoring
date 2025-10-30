import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { connect, useSelector } from 'react-redux';
import {
  Button, Collapsible,
} from '@openedx/paragon';
import { useEditorContext } from '@src/editors/EditorContext';
import { selectors, actions } from '@src/editors/data/redux';
import ScoringCard from './settingsComponents/ScoringCard';
import ShowAnswerCard from './settingsComponents/ShowAnswerCard';
import HintsCard from './settingsComponents/HintsCard';
import ResetCard from './settingsComponents/ResetCard';
import TimerCard from './settingsComponents/TimerCard';
import TypeCard from './settingsComponents/TypeCard';
import { ToleranceCard } from './settingsComponents/Tolerance';
import GroupFeedbackCard from './settingsComponents/GroupFeedback/index';
import SwitchEditorCard from './settingsComponents/SwitchEditorCard';
import messages from './messages';
import { showAdvancedSettingsCards } from './hooks';

import './index.scss';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import Randomization from './settingsComponents/Randomization';

// This widget should be connected, grab all settings from store, update them as needed.
const SettingsWidget = ({
  problemType,
  // redux
  answers,
  groupFeedbackList,
  blockTitle,
  correctAnswerCount,
  settings,
  setBlockTitle,
  updateSettings,
  updateField,
  updateAnswer,
  defaultSettings,
  images,
  isLibrary,
}) => {
  const {
    learningContextId,
    isMarkdownEditorEnabledForContext,
  } = useEditorContext();
  const rawMarkdown = useSelector(selectors.problem.rawMarkdown);
  const isMarkdownEditorEnabled = useSelector(selectors.problem.isMarkdownEditorEnabled);
  const showMarkdownEditorButton = isMarkdownEditorEnabledForContext && rawMarkdown;
  const { isAdvancedCardsVisible, showAdvancedCards } = showAdvancedSettingsCards();
  const feedbackCard = () => {
    if ([ProblemTypeKeys.MULTISELECT].includes(problemType)) {
      return (
        <div className="mt-3"><GroupFeedbackCard
          groupFeedbacks={groupFeedbackList}
          updateSettings={updateField}
          answers={answers}
        />
        </div>
      );
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (<></>);
  };

  return (
    <div className="settingsWidget ml-4">
      <div className="mb-3">
        <TypeCard
          answers={answers}
          blockTitle={blockTitle}
          correctAnswerCount={correctAnswerCount}
          problemType={problemType}
          setBlockTitle={setBlockTitle}
          updateField={updateField}
          updateAnswer={updateAnswer}
        />
      </div>
      {ProblemTypeKeys.NUMERIC === problemType
          && (
          <div className="my-3">
            <ToleranceCard
              updateSettings={updateSettings}
              answers={answers}
              tolerance={settings.tolerance}
              correctAnswerCount={correctAnswerCount}
            />
          </div>
          )}
      {!isLibrary && (
        <div className="my-3">
          <ScoringCard
            scoring={settings.scoring}
            defaultValue={defaultSettings.maxAttempts}
            updateSettings={updateSettings}
          />
        </div>
      )}
      <div className="mt-3">
        <HintsCard
          problemType={problemType}
          hints={settings.hints}
          updateSettings={updateSettings}
          {...{
            images,
            isLibrary,
            learningContextId,
          }}
        />
      </div>
      {feedbackCard()}
      <div>
        <Collapsible.Advanced open={!isAdvancedCardsVisible}>
          <Collapsible.Body className="collapsible-body small">
            <Button
              className="my-3 px-0 text-info-500"
              variant="link"
              size="inline"
              onClick={showAdvancedCards}
            >
              <FormattedMessage {...messages.showAdvanceSettingsButtonText} />
            </Button>
          </Collapsible.Body>
        </Collapsible.Advanced>
      </div>
      <Collapsible.Advanced open={isAdvancedCardsVisible}>
        <Collapsible.Body className="collapsible-body">
          {!isLibrary && (
            <div className="my-3">
              <ShowAnswerCard
                showAnswer={settings.showAnswer}
                defaultValue={defaultSettings.showanswer}
                updateSettings={updateSettings}
              />
            </div>
          )}
          {!isLibrary && (
            <div className="my-3">
              <ResetCard
                showResetButton={settings.showResetButton}
                defaultValue={defaultSettings.showResetButton}
                updateSettings={updateSettings}
              />
            </div>
          )}
          {
            problemType === ProblemTypeKeys.ADVANCED && (
            <div className="my-3">
              <Randomization
                randomization={settings.randomization}
                defaultValue={defaultSettings.rerandomize}
                updateSettings={updateSettings}
              />
            </div>
            )
          }
          {!isLibrary && (
            <div className="my-3">
              <TimerCard timeBetween={settings.timeBetween} updateSettings={updateSettings} />
            </div>
          )}
          <div className="my-3">
            <SwitchEditorCard problemType={problemType} editorType="advanced" />
          </div>
          { (showMarkdownEditorButton && !isMarkdownEditorEnabled) // Only show button if not already in markdown editor
          && (
          <div className="my-3">
            <SwitchEditorCard problemType={problemType} editorType="markdown" />
          </div>
          )}
        </Collapsible.Body>
      </Collapsible.Advanced>
    </div>
  );
};

SettingsWidget.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.shape({
    correct: PropTypes.bool,
    id: PropTypes.string,
    selectedFeedback: PropTypes.string,
    title: PropTypes.string,
    unselectedFeedback: PropTypes.string,
  })).isRequired,
  groupFeedbackList: PropTypes.arrayOf(
    PropTypes.shape(
      {
        id: PropTypes.number,
        feedback: PropTypes.string,
        answers: PropTypes.arrayOf(PropTypes.string),
      },
    ),
  ).isRequired,
  blockTitle: PropTypes.string.isRequired,
  correctAnswerCount: PropTypes.number.isRequired,
  problemType: PropTypes.string.isRequired,
  setBlockTitle: PropTypes.func.isRequired,
  updateAnswer: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  defaultSettings: PropTypes.shape({
    maxAttempts: PropTypes.number,
    showanswer: PropTypes.string,
    showResetButton: PropTypes.bool,
    rerandomize: PropTypes.string,
  }).isRequired,
  images: PropTypes.shape({}).isRequired,
  isLibrary: PropTypes.bool.isRequired,
  // eslint-disable-next-line
  settings: PropTypes.any.isRequired,
};

const mapStateToProps = (state) => ({
  groupFeedbackList: selectors.problem.groupFeedbackList(state),
  settings: selectors.problem.settings(state),
  answers: selectors.problem.answers(state),
  blockTitle: selectors.app.blockTitle(state),
  correctAnswerCount: selectors.problem.correctAnswerCount(state),
  defaultSettings: selectors.problem.defaultSettings(state),
  images: selectors.app.images(state),
  isLibrary: selectors.app.isLibrary(state),
});

export const mapDispatchToProps = {
  setBlockTitle: actions.app.setBlockTitle,
  updateSettings: actions.problem.updateSettings,
  updateField: actions.problem.updateField,
  updateAnswer: actions.problem.updateAnswer,
};

export const SettingsWidgetInternal = SettingsWidget; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(SettingsWidget);
