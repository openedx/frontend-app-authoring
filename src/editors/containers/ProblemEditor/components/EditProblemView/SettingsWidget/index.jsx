import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import {
  Button, Col, Collapsible, Container, Row,
} from '@edx/paragon';
import { selectors, actions } from '../../../../../data/redux';
import ScoringCard from './settingsComponents/ScoringCard';
import ShowAnswerCard from './settingsComponents/ShowAnswerCard';
import HintsCard from './settingsComponents/HintsCard';
import ResetCard from './settingsComponents/ResetCard';
import MatlabCard from './settingsComponents/MatlabCard';
import TimerCard from './settingsComponents/TimerCard';
import TypeCard from './settingsComponents/TypeCard';
import SwitchToAdvancedEditorCard from './settingsComponents/SwitchToAdvancedEditorCard';
import messages from './messages';
import { showAdvancedSettingsCards } from './hooks';

import './index.scss';

// This widget should be connected, grab all settings from store, update them as needed.
export const SettingsWidget = ({
  problemType,
  // redux
  answers,
  correctAnswerCount,
  settings,
  updateSettings,
  updateField,
  updateAnswer,
}) => {
  const { isAdvancedCardsVisible, showAdvancedCards } = showAdvancedSettingsCards();
  return (
    <div>
      <div>
        <h3>
          <FormattedMessage {...messages.settingsWidgetTitle} />
        </h3>
        <Container>
          <Row>
            <Col>
              <Row className="my-2">
                <TypeCard
                  answers={answers}
                  correctAnswerCount={correctAnswerCount}
                  problemType={problemType}
                  updateField={updateField}
                  updateAnswer={updateAnswer}
                />
              </Row>
              <Row className="my-2">
                <ScoringCard scoring={settings.scoring} updateSettings={updateSettings} />
              </Row>
              <Row className="mt-2">
                <HintsCard hints={settings.hints} updateSettings={updateSettings} />
              </Row>

              <Row>
                <Collapsible.Advanced open={!isAdvancedCardsVisible}>
                  <Collapsible.Body className="collapsible-body">
                    <Button
                      className="my-3 ml-2"
                      variant="link"
                      size="inline"
                      onClick={showAdvancedCards}
                    >
                      <FormattedMessage {...messages.showAdvanceSettingsButtonText} />
                    </Button>
                  </Collapsible.Body>
                </Collapsible.Advanced>
              </Row>

              <Collapsible.Advanced open={isAdvancedCardsVisible}>
                <Collapsible.Body className="collapsible-body">
                  <Row className="my-2">
                    <ShowAnswerCard showAnswer={settings.showAnswer} updateSettings={updateSettings} />
                  </Row>
                  <Row className="my-2">
                    <ResetCard showResetButton={settings.showResetButton} updateSettings={updateSettings} />
                  </Row>
                  <Row className="my-2">
                    <TimerCard timeBetween={settings.timeBetween} updateSettings={updateSettings} />
                  </Row>
                  <Row className="my-2">
                    <MatlabCard matLabApiKey={settings.matLabApiKey} updateSettings={updateSettings} />
                  </Row>
                  <Row className="my-2">
                    <SwitchToAdvancedEditorCard />
                  </Row>
                </Collapsible.Body>
              </Collapsible.Advanced>
            </Col>
          </Row>
        </Container>
      </div>

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
  correctAnswerCount: PropTypes.number.isRequired,
  problemType: PropTypes.string.isRequired,
  updateAnswer: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  // eslint-disable-next-line
  settings: PropTypes.any.isRequired,
};

const mapStateToProps = (state) => ({
  settings: selectors.problem.settings(state),
  answers: selectors.problem.answers(state),
  correctAnswerCount: selectors.problem.correctAnswerCount(state),
});

export const mapDispatchToProps = {
  updateSettings: actions.problem.updateSettings,
  updateField: actions.problem.updateField,
  updateAnswer: actions.problem.updateAnswer,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SettingsWidget));
