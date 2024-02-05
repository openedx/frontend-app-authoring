import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Alert, Form, Hyperlink } from '@openedx/paragon';
import {
  Warning as WarningIcon,
} from '@openedx/paragon/icons';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

import PrereqSettings from './PrereqSettings';

const AdvancedTab = ({
  values,
  setFieldValue,
  prereqs,
  releasedToStudents,
  wasExamEverLinkedWithExternal,
  enableProctoredExams,
  supportsOnboarding,
  wasProctoredExam,
  showReviewRules,
  onlineProctoringRules,
}) => {
  const {
    isTimeLimited,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    defaultTimeLimitMinutes,
    examReviewRules,
  } = values;
  let examTypeValue = 'none';

  if (isTimeLimited && isProctoredExam) {
    if (isOnboardingExam) {
      examTypeValue = 'onboardingExam';
    } else if (isPracticeExam) {
      examTypeValue = 'practiceExam';
    } else {
      examTypeValue = 'proctoredExam';
    }
  } else if (isTimeLimited) {
    examTypeValue = 'timed';
  }

  const formatHour = (hour) => {
    const hh = Math.floor(hour / 60);
    const mm = hour % 60;
    let hhs = `${hh}`;
    let mms = `${mm}`;
    if (hh < 10) {
      hhs = `0${hh}`;
    }
    if (mm < 10) {
      mms = `0${mm}`;
    }
    if (Number.isNaN(hh)) {
      hhs = '00';
    }
    if (Number.isNaN(mm)) {
      mms = '00';
    }
    return `${hhs}:${mms}`;
  };

  const [timeLimit, setTimeLimit] = useState(formatHour(defaultTimeLimitMinutes));
  const showReviewRulesDiv = showReviewRules && isProctoredExam && !isPracticeExam && !isOnboardingExam;

  const handleChange = (e) => {
    if (e.target.value === 'timed') {
      setFieldValue('isTimeLimited', true);
      setFieldValue('isOnboardingExam', false);
      setFieldValue('isPracticeExam', false);
      setFieldValue('isProctoredExam', false);
    } else if (e.target.value === 'onboardingExam') {
      setFieldValue('isOnboardingExam', true);
      setFieldValue('isProctoredExam', true);
      setFieldValue('isTimeLimited', true);
      setFieldValue('isPracticeExam', false);
    } else if (e.target.value === 'practiceExam') {
      setFieldValue('isPracticeExam', true);
      setFieldValue('isProctoredExam', true);
      setFieldValue('isTimeLimited', true);
      setFieldValue('isOnboardingExam', false);
    } else if (e.target.value === 'proctoredExam') {
      setFieldValue('isProctoredExam', true);
      setFieldValue('isTimeLimited', true);
      setFieldValue('isOnboardingExam', false);
      setFieldValue('isPracticeExam', false);
    } else {
      setFieldValue('isTimeLimited', false);
      setFieldValue('isOnboardingExam', false);
      setFieldValue('isPracticeExam', false);
      setFieldValue('isProctoredExam', false);
    }
  };

  const setCurrentTimeLimit = (event) => {
    const { validity: { valid } } = event.target;
    let { value } = event.target;
    value = value.trim();
    if (value && valid) {
      const minutes = moment.duration(value).asMinutes();
      setFieldValue('defaultTimeLimitMinutes', minutes);
    }
    setTimeLimit(value);
  };

  const renderAlerts = () => {
    const proctoredExamLockedIn = releasedToStudents && wasExamEverLinkedWithExternal;
    return (
      <>
        {proctoredExamLockedIn && !wasProctoredExam && (
          <Alert variant="warning" icon={WarningIcon}>
            <FormattedMessage {...messages.proctoredExamLockedAndisNotProctoredExamAlert} />
          </Alert>
        )}
        {proctoredExamLockedIn && wasProctoredExam && (
          <Alert variant="warning" icon={WarningIcon}>
            <FormattedMessage {...messages.proctoredExamLockedAndisProctoredExamAlert} />
          </Alert>
        )}
      </>
    );
  };

  return (
    <>
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.setSpecialExam} /></h5>
      <hr />
      <Form.RadioSet
        name="specialExam"
        onChange={handleChange}
        value={examTypeValue}
      >
        {renderAlerts()}
        <Form.Radio value="none">
          <FormattedMessage {...messages.none} />
        </Form.Radio>
        <Form.Radio
          value="timed"
          description={<FormattedMessage {...messages.timedDescription} />}
          controlClassName="mw-1-25rem"
        >
          <FormattedMessage {...messages.timed} />
        </Form.Radio>
        {enableProctoredExams && (
          <>
            <Form.Radio
              value="proctoredExam"
              description={<FormattedMessage {...messages.proctoredExamDescription} />}
              controlClassName="mw-1-25rem"
            >
              <FormattedMessage {...messages.proctoredExam} />
            </Form.Radio>
            {supportsOnboarding ? (
              <Form.Radio
                description={<FormattedMessage {...messages.onboardingExamDescription} />}
                value="onboardingExam"
                controlClassName="mw-1-25rem"
              >
                <FormattedMessage {...messages.onboardingExam} />
              </Form.Radio>
            ) : (
              <Form.Radio
                value="practiceExam"
                controlClassName="mw-1-25rem"
                description={<FormattedMessage {...messages.practiceExamDescription} />}
              >
                <FormattedMessage {...messages.practiceExam} />
              </Form.Radio>
            )}
          </>
        )}
      </Form.RadioSet>
      { isTimeLimited && (
        <div className="mt-3" data-testid="advanced-tab-hours-picker-wrapper">
          <Form.Group>
            <Form.Label>
              <FormattedMessage {...messages.timeAllotted} />
            </Form.Label>
            <Form.Control
              onChange={setCurrentTimeLimit}
              value={timeLimit}
              placeholder="HH:MM"
              pattern="^[0-9][0-9]:[0-5][0-9]$"
            />
          </Form.Group>
          <Form.Text><FormattedMessage {...messages.timeLimitDescription} /></Form.Text>
        </div>
      )}
      { showReviewRulesDiv && (
        <div className="mt-3">
          <Form.Group>
            <Form.Label>
              <FormattedMessage {...messages.reviewRulesLabel} />
            </Form.Label>
            <Form.Control
              onChange={(e) => setFieldValue('examReviewRules', e.target.value)}
              value={examReviewRules}
              as="textarea"
              rows="3"
            />
          </Form.Group>
          <Form.Text>
            { onlineProctoringRules ? (
              <FormattedMessage
                {...messages.reviewRulesDescriptionWithLink}
                values={{
                  hyperlink: (
                    <Hyperlink
                      destination={onlineProctoringRules}
                      target="_blank"
                      showLaunchIcon={false}
                    >
                      <FormattedMessage
                        {...messages.reviewRulesDescriptionLinkText}
                      />
                    </Hyperlink>
                  ),
                }}
              />
            ) : (
              <FormattedMessage {...messages.reviewRulesDescription} />
            )}
          </Form.Text>
        </div>
      )}
      <PrereqSettings
        values={values}
        setFieldValue={setFieldValue}
        prereqs={prereqs}
      />
    </>
  );
};

AdvancedTab.defaultProps = {
  prereqs: [],
  wasExamEverLinkedWithExternal: false,
  enableProctoredExams: false,
  supportsOnboarding: false,
  wasProctoredExam: false,
  showReviewRules: false,
  onlineProctoringRules: '',
};

AdvancedTab.propTypes = {
  values: PropTypes.shape({
    isTimeLimited: PropTypes.bool.isRequired,
    defaultTimeLimitMinutes: PropTypes.number,
    isPrereq: PropTypes.bool,
    prereqUsageKey: PropTypes.string,
    prereqMinScore: PropTypes.number,
    prereqMinCompletion: PropTypes.number,
    isProctoredExam: PropTypes.bool,
    isPracticeExam: PropTypes.bool,
    isOnboardingExam: PropTypes.bool,
    examReviewRules: PropTypes.string,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
  releasedToStudents: PropTypes.bool.isRequired,
  wasExamEverLinkedWithExternal: PropTypes.bool,
  enableProctoredExams: PropTypes.bool,
  supportsOnboarding: PropTypes.bool,
  wasProctoredExam: PropTypes.bool,
  showReviewRules: PropTypes.bool,
  onlineProctoringRules: PropTypes.string,
};

export default injectIntl(AdvancedTab);
