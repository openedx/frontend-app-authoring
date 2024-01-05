import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form } from '@edx/paragon';
import { useIntl, FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { DatepickerControl, DATEPICKER_TYPES } from '../../generic/datepicker-control';
import messages from './messages';
import { convertToStringFromDate } from '../../utils';

const AdvancedTab = ({
  isTimeLimited,
  setIsTimeLimited,
  defaultTimeLimit,
  setDefaultTimeLimit,
}) => {
  const intl = useIntl();

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

  const [timeLimit, setTimeLimit] = useState(convertToStringFromDate(moment(formatHour(defaultTimeLimit), 'HH:mm')));

  const handleChange = (e) => {
    if (e.target.value === 'timed') {
      setIsTimeLimited(true);
    } else {
      setDefaultTimeLimit(null);
      setIsTimeLimited(false);
    }
  };

  const setCurrentTimeLimit = (dateStr) => {
    if (dateStr) {
      const minutes = moment.duration(moment(dateStr).format('HH:mm')).asMinutes();
      setDefaultTimeLimit(minutes);
      setTimeLimit(dateStr);
    }
  };

  return (
    <>
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.setSpecialExam} /></h5>
      <hr />
      <Form.RadioSet
        name="specialExam"
        onChange={handleChange}
        value={isTimeLimited ? 'timed' : 'none'}
      >
        <Form.Radio value="none">
          <FormattedMessage {...messages.none} />
        </Form.Radio>
        <Form.Radio value="timed">
          <FormattedMessage {...messages.timed} />
        </Form.Radio>
        <Form.Text><FormattedMessage {...messages.timedDescription} /></Form.Text>
      </Form.RadioSet>
      { isTimeLimited && (
        <div className="hide-header mt-3" data-testid="advanced-tab-hours-picker-wrapper">
          <DatepickerControl
            type={DATEPICKER_TYPES.time}
            value={timeLimit}
            label={intl.formatMessage(messages.timeAllotted)}
            controlName="allotted-time"
            onChange={setCurrentTimeLimit}
          />
          <Form.Text><FormattedMessage {...messages.timeLimitDescription} /></Form.Text>
        </div>
      )}
    </>
  );
};

AdvancedTab.propTypes = {
  isTimeLimited: PropTypes.bool.isRequired,
  setIsTimeLimited: PropTypes.func.isRequired,
  defaultTimeLimit: PropTypes.number.isRequired,
  setDefaultTimeLimit: PropTypes.func.isRequired,
};

export default injectIntl(AdvancedTab);
