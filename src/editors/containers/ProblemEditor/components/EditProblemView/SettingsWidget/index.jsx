import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, Collapsible,
} from '@openedx/paragon';
import { selectors, actions } from '../../../../../data/redux';
import ScoringCard from './settingsComponents/ScoringCard';
import ShowAnswerCard from './settingsComponents/ShowAnswerCard';
import HintsCard from './settingsComponents/HintsCard';
import ResetCard from './settingsComponents/ResetCard';
import TimerCard from './settingsComponents/TimerCard';
import TypeCard from './settingsComponents/TypeCard';
import ToleranceCard from './settingsComponents/Tolerance';
import GroupFeedbackCard from './settingsComponents/GroupFeedback/index';
import SwitchEditorCard from './settingsComponents/SwitchEditorCard';
import messages from './messages';
import { showAdvancedSettingsCards } from './hooks';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import Randomization from './settingsComponents/Randomization';

import './index.scss';

const SettingsWidget = ({
  problemType,
}) => {
  const dispatch = useDispatch();
  const {
    groupFeedbackList,
    settings,
    answers,
    blockTitle,
    correctAnswerCount,
    defaultSettings,
    images,
    isLibrary,
    learningContextId,
    showMarkdownEditorButton,
  } = useSelector((state) => ({
    groupFeedbackList: selectors.problem.groupFeedbackList(state),
    settings: selectors.problem.settings(state),
    answers: selectors.problem.answers(state),
    blockTitle: selectors.app.blockTitle(state),
    correctAnswerCount: selectors.problem.correctAnswerCount(state),
    defaultSettings: selectors.problem.defaultSettings(state),
    images: selectors.app.images(state),
    isLibrary: selectors.app.isLibrary(state),
    learningContextId: selectors.app.learningContextId(state),
    showMarkdownEditorButton: selectors.app.isMarkdownEditorEnabledForCourse(state)
      && selectors.problem.rawMarkdown(state),
  }));

  const { isAdvancedCardsVisible, showAdvancedCards } = showAdvancedSettingsCards();

  const setBlockTitle = (title) => dispatch(actions.app.setBlockTitle(title));
  const updateSettings = (newSettings) => dispatch(actions.problem.updateSettings(newSettings));
  const updateField = (fieldName, value) => dispatch(actions.problem.updateField(fieldName, value));
  const updateAnswer = (index, update) => dispatch(actions.problem.updateAnswer(index, update));

  const feedbackCard = () => {
    if (problemType === ProblemTypeKeys.MULTISELECT) {
      return (
        <div className="mt-3">
          <GroupFeedbackCard
            groupFeedbacks={groupFeedbackList}
            updateSettings={updateField}
            answers={answers}
          />
        </div>
      );
    }
    return null;
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

      {problemType === ProblemTypeKeys.NUMERIC && (
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
          images={images}
          isLibrary={isLibrary}
          learningContextId={learningContextId}
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
          {problemType === ProblemTypeKeys.ADVANCED && (
            <div className="my-3">
              <Randomization
                randomization={settings.randomization}
                defaultValue={defaultSettings.rerandomize}
                updateSettings={updateSettings}
              />
            </div>
          )}
          {!isLibrary && (
            <div className="my-3">
              <TimerCard
                timeBetween={settings.timeBetween}
                updateSettings={updateSettings}
              />
            </div>
          )}
          <div className="my-3">
            <SwitchEditorCard problemType={problemType} editorType="advanced" />
          </div>
          {showMarkdownEditorButton && (
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
  problemType: PropTypes.string.isRequired,
};

export const SettingsWidgetInternal = SettingsWidget; // For testing
export default injectIntl(SettingsWidget);
