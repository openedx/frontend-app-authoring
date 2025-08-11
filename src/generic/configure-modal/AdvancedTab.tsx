import React, { useState } from 'react';
import moment from 'moment';
import {
  Alert,
  Form,
  Hyperlink,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { Warning as WarningIcon, Question } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

import PrereqSettings from './PrereqSettings';

interface ValuesProps {
  isTimeLimited: boolean;
  defaultTimeLimitMinutes?: number;
  isPrereq?: boolean;
  prereqUsageKey?: string;
  prereqMinScore?: number;
  prereqMinCompletion?: number;
  isProctoredExam?: boolean;
  isPracticeExam?: boolean;
  isOnboardingExam?: boolean;
  examReviewRules?: string;
}

interface PrereqItem {
  blockUsageKey: string;
  blockDisplayName: string;
}

interface AdvancedTabProps {
  values: ValuesProps;
  setFieldValue: (field: string, value: any) => void;
  releasedToStudents: boolean;
  prereqs?: PrereqItem[];
  wasExamEverLinkedWithExternal?: boolean;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  supportsOnboarding?: boolean;
  wasProctoredExam?: boolean;
  showReviewRules?: boolean;
  onlineProctoringRules?: string;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({
  values,
  setFieldValue,
  releasedToStudents,
  prereqs = [],
  wasExamEverLinkedWithExternal = false,
  enableProctoredExams = false,
  enableTimedExams = true,
  supportsOnboarding = false,
  wasProctoredExam = false,
  showReviewRules = false,
  onlineProctoringRules = '',
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

  const intl = useIntl();

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

  const formatHour = (hour: number | undefined): string => {
    if (hour === undefined) {
      return '00:00';
    }

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

  const [timeLimit, setTimeLimit] = useState(
    formatHour(defaultTimeLimitMinutes),
  );
  const showReviewRulesDiv = showReviewRules && isProctoredExam && !isPracticeExam && !isOnboardingExam;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const setCurrentTimeLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      validity: { valid },
    } = event.target;
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
            <FormattedMessage
              {...messages.proctoredExamLockedAndisNotProctoredExamAlert}
            />
          </Alert>
        )}
        {proctoredExamLockedIn && wasProctoredExam && (
          <Alert variant="warning" icon={WarningIcon}>
            <FormattedMessage
              {...messages.proctoredExamLockedAndisProctoredExamAlert}
            />
          </Alert>
        )}
      </>
    );
  };

  return (
    <>
      <div className="d-flex align-items-center mt-4">
        <h5 className="text-gray-700 mb-0">
          <FormattedMessage {...messages.setSpecialExam} />
        </h5>
        {!enableTimedExams && (
          <OverlayTrigger
            placement="top"
            overlay={(
              <Tooltip id={messages.timedExamsDisabledTooltip.id}>
                <FormattedMessage {...messages.timedExamsDisabledTooltip} />
              </Tooltip>
            )}
          >
            <Question
              className="ml-2 text-gray-500"
              style={{ cursor: 'help' }}
            />
          </OverlayTrigger>
        )}
      </div>
      <hr />
      <Form.RadioSet
        name="specialExam"
        onChange={handleChange}
        value={examTypeValue}
      >
        {renderAlerts()}
        <Form.Radio value="none" disabled={!enableTimedExams}>
          <FormattedMessage {...messages.none} />
        </Form.Radio>
        <Form.Radio
          value="timed"
          disabled={!enableTimedExams}
          description={<FormattedMessage {...messages.timedDescription} />}
          controlClassName="mw-1-25rem"
        >
          <FormattedMessage {...messages.timed} />
        </Form.Radio>
        {enableProctoredExams && (
          <>
            <Form.Radio
              value="proctoredExam"
              description={
                <FormattedMessage {...messages.proctoredExamDescription} />
              }
              controlClassName="mw-1-25rem"
            >
              <FormattedMessage {...messages.proctoredExam} />
            </Form.Radio>
            {supportsOnboarding ? (
              <Form.Radio
                description={
                  <FormattedMessage {...messages.onboardingExamDescription} />
                }
                value="onboardingExam"
                controlClassName="mw-1-25rem"
              >
                <FormattedMessage {...messages.onboardingExam} />
              </Form.Radio>
            ) : (
              <Form.Radio
                value="practiceExam"
                controlClassName="mw-1-25rem"
                description={
                  <FormattedMessage {...messages.practiceExamDescription} />
                }
              >
                <FormattedMessage {...messages.practiceExam} />
              </Form.Radio>
            )}
          </>
        )}
      </Form.RadioSet>
      {isTimeLimited && (
        <div className="mt-3" data-testid="advanced-tab-hours-picker-wrapper">
          <Form.Group>
            <Form.Label>
              <FormattedMessage {...messages.timeAllotted} />
            </Form.Label>
            <Form.Control
              onChange={setCurrentTimeLimit}
              value={timeLimit}
              placeholder={intl.formatMessage(messages.timeLimitPlaceholder)}
              pattern="^[0-9][0-9]:[0-5][0-9]$"
            />
          </Form.Group>
          <Form.Text>
            <FormattedMessage {...messages.timeLimitDescription} />
          </Form.Text>
        </div>
      )}
      {showReviewRulesDiv && (
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
            {onlineProctoringRules ? (
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

export default AdvancedTab;
