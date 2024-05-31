import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import { DEFAULT_TIME_STAMP, TIME_FORMAT } from '../../constants';
import { formatTime, timerValidation } from './utils';
import messages from './messages';

const DeadlineSection = ({
  intl, setShowSavePrompt, gracePeriod, setGradingData, setShowSuccessAlert,
}) => {
  const timeStampValue = gracePeriod
    ? `${formatTime(gracePeriod.hours)}:${formatTime(gracePeriod.minutes)}`
    : DEFAULT_TIME_STAMP;
  const [newDeadlineValue, setNewDeadlineValue] = useState(timeStampValue);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setNewDeadlineValue(timeStampValue);
  }, [gracePeriod]);

  const handleDeadlineChange = (e) => {
    const { value } = e.target;
    const [hours, minutes] = value.split(':');

    setNewDeadlineValue(value);

    if (timerValidation(value, setShowSavePrompt, setIsError)) {
      setGradingData(prevData => ({
        ...prevData,
        gracePeriod: {
          hours: +hours,
          minutes: +minutes,
        },
      }));
      setShowSuccessAlert(false);
    }
  };

  return (
    <Form.Group className={classNames('w-50 form-group-custom', {
      'form-group-custom_isInvalid': isError,
    })}
    >
      <Form.Label className="grading-label">
        {intl.formatMessage(messages.gracePeriodOnDeadlineLabel)}
      </Form.Label>
      <Form.Control
        data-testid="deadline-period-input"
        value={newDeadlineValue}
        onChange={handleDeadlineChange}
        placeholder={TIME_FORMAT.toUpperCase()}
      />
      <Form.Control.Feedback className="grading-description">
        {intl.formatMessage(messages.gracePeriodOnDeadlineDescription)}
      </Form.Control.Feedback>
      {isError && (
        <Form.Control.Feedback className="feedback-error" type="invalid">
          {intl.formatMessage(messages.gracePeriodOnDeadlineErrorMsg, { timeFormat: TIME_FORMAT.toUpperCase() })}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

DeadlineSection.defaultProps = {
  gracePeriod: null,
};

DeadlineSection.propTypes = {
  intl: intlShape.isRequired,
  setShowSavePrompt: PropTypes.func.isRequired,
  setGradingData: PropTypes.func.isRequired,
  setShowSuccessAlert: PropTypes.func.isRequired,
  gracePeriod: PropTypes.shape({
    hours: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minutes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default injectIntl(DeadlineSection);
