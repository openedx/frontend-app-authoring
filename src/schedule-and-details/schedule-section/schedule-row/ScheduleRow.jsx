import React from 'react';
import PropTypes from 'prop-types';

import { DatepickerControl, DATEPICKER_TYPES } from '../../../generic/datepicker-control';

export const SCHEDULE_ROW_TYPES = {
  datetime: 'datetime',
  dropdown: 'dropdown',
};

export const ScheduleRow = ({
  value,
  labels,
  helpText,
  readonly,
  controlName,
  errorFeedback,
  onChange,
}) => (
  <li className="schedule-date-item">
    <div className="schedule-date-item-container">
      <DatepickerControl
        type={DATEPICKER_TYPES.date}
        value={value}
        label={labels[0]}
        helpText={helpText}
        readonly={readonly}
        isInvalid={!!errorFeedback}
        controlName={`${controlName}-date`}
        onChange={(date) => onChange(date, controlName)}
      />
      <DatepickerControl
        type={DATEPICKER_TYPES.time}
        value={value}
        label={labels[1]}
        readonly={readonly}
        isInvalid={!!errorFeedback}
        controlName={`${controlName}-time`}
        onChange={(date) => onChange(date, controlName)}
        showUTC
      />
    </div>
    {errorFeedback && (
      <span className="schedule-date-item-error">{errorFeedback}</span>
    )}
  </li>
);

ScheduleRow.defaultProps = {
  value: '',
  helpText: '',
  readonly: false,
  errorFeedback: '',
};

ScheduleRow.propTypes = {
  value: PropTypes.string,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  helpText: PropTypes.string,
  readonly: PropTypes.bool,
  controlName: PropTypes.string.isRequired,
  errorFeedback: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default ScheduleRow;
