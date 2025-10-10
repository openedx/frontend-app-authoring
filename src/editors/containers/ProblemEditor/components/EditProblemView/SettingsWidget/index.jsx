import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Collapsible } from '@openedx/paragon';
import { useEditorContext } from '@src/editors/EditorContext';
import { selectors, actions } from '@src/editors/data/redux';
import ScoringCard from './settingsComponents/ScoringCard';
import ShowAnswerCard from './settingsComponents/ShowAnswerCard';
import HintsCard from './settingsComponents/HintsCard';
import ResetCard from './settingsComponents/ResetCard';
import TimerCard from './settingsComponents/TimerCard';
import TypeCard from './settingsComponents/TypeCard';
import ToleranceCard from './settingsComponents/Tolerance';
import GroupFeedbackCard from './settingsComponents/GroupFeedback';
import SwitchEditorCard from './settingsComponents/SwitchEditorCard';
import messages from './messages';
import { showAdvancedSettingsCards } from './hooks';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import Randomization from './settingsComponents/Randomization';
import './index.scss';

const SettingsWidget = ({ problemType }) => {
  const dispatch = useDispatch();

  // ==== Redux selectors ====
  const groupFeedbackList = useSelector(selectors.problem.groupFeedbackList);
  const settings = useSelector(selectors.problem.settings);
  const answers = useSelector(selectors.problem.answers);
  const blockTitle = useSelector(selectors.app.blockTitle);
  const correctAnswerCount = useSelector(selectors.problem.correctAnswerCount);
  const defaultSettings = useSelector(selectors.problem.defaultSettings);
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const rawMarkdown = useSelector(selectors.problem.rawMarkdown);

  const { learningContextId, isMarkdownEditorEnabledForContext } = useEditorContext();
  const showMarkdownEditorButton = isMarkdownEditorEnabledForContext && rawMarkdown;

  const setBlockTitle = (title) => dispatch(actions.app.setBlockTitle(title));
  const updateSettings = (setting) => dispatch(actions.problem.updateSettings(setting));
  const updateField = (field) => dispatch(actions.problem.updateField(field));
  const updateAnswer = (answer) => dispatch(actions.problem.updateAnswer(answer));

  const { isAdvancedCardsVisible, showAdvancedCards } = showAdvancedSettingsCards();

  const feedbackCard = () => {
    if ([ProblemTypeKeys.MULTISELECT].includes(problemType)) {
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
      {/* Problem type settings */}
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

      {/* Numeric tolerance */}
      {ProblemTypeKeys.NUMERIC === problemType && (
        <div className="my-3">
          <ToleranceCard
            updateSettings={updateSettings}
            answers={answers}
            tolerance={settings.tolerance}
            correctAnswerCount={correctAnswerCount}
          />
        </div>
      )}

      {/* Scoring */}
      {!isLibrary && (
        <div className="my-3">
          <ScoringCard
            scoring={settings.scoring}
            defaultValue={defaultSettings.maxAttempts}
            updateSettings={updateSettings}
          />
        </div>
      )}

      {/* Hints */}
      <div className="mt-3">
        <HintsCard
          problemType={problemType}
          hints={settings.hints}
          updateSettings={updateSettings}
          {...{ images, isLibrary, learningContextId }}
        />
      </div>

      {feedbackCard()}

      {/* Advanced settings toggle */}
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

      {/* Advanced settings section */}
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
              <TimerCard timeBetween={settings.timeBetween} updateSettings={updateSettings} />
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

export default SettingsWidget;
