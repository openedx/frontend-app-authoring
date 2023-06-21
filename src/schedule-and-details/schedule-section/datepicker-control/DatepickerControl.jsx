import React from 'react';
import DatePicker from 'react-datepicker/dist';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Icon } from '@edx/paragon';
import { Calendar } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { convertToDateFromString, convertToStringFromDate } from '../../utils';
import { DATE_FORMAT, TIME_FORMAT } from './constants';
import messages from './messages';

export const DATEPICKER_TYPES = {
  date: 'date',
  time: 'time',
};

const DatepickerControl = ({
  intl,
  type,
  label,
  value,
  showUTC,
  readonly,
  helpText,
  isInvalid,
  controlName,
  onChange,
}) => {
  const formattedDate = convertToDateFromString(value);
  const inputFormat = {
    [DATEPICKER_TYPES.date]: DATE_FORMAT,
    [DATEPICKER_TYPES.time]: TIME_FORMAT,
  };

  return (
    <Form.Group className="datepicker-custom">
      <Form.Label className="d-flex justify-content-between mb-0">
        <span className="datepicker-custom-control-label">{label}</span>
        {showUTC && (
          <span className="h6 font-weight-normal text-gray-500">
            ({intl.formatMessage(messages.datepickerUTC)})
          </span>
        )}
      </Form.Label>
      <div className="position-relative">
        {type === DATEPICKER_TYPES.date && !readonly && (
          <Icon
            src={Calendar}
            className="datepicker-custom-control-icon"
            alt={intl.formatMessage(messages.calendarAltText)}
          />
        )}
        <DatePicker
          name={controlName}
          selected={formattedDate}
          disabled={readonly}
          dateFormat={inputFormat[type]}
          timeFormat={inputFormat[type]}
          className={classNames('datepicker-custom-control', {
            'datepicker-custom-control_readonly': readonly,
            'datepicker-custom-control_isInvalid': isInvalid,
          })}
          autoComplete="off"
          selectsStart
          showTimeSelect={type === DATEPICKER_TYPES.time}
          showTimeSelectOnly={type === DATEPICKER_TYPES.time}
          placeholderText={inputFormat[type].toLocaleUpperCase()}
          showPopperArrow={false}
          onChange={(date) => onChange(convertToStringFromDate(date))}
        />
      </div>
      {helpText && <Form.Control.Feedback>{helpText}</Form.Control.Feedback>}
    </Form.Group>
  );
};

DatepickerControl.defaultProps = {
  helpText: '',
  showUTC: false,
  value: '',
  readonly: false,
  isInvalid: false,
};

DatepickerControl.propTypes = {
  intl: intlShape.isRequired,
  type: PropTypes.oneOf(Object.values(DATEPICKER_TYPES)).isRequired,
  value: PropTypes.string,
  label: PropTypes.string.isRequired,
  showUTC: PropTypes.bool,
  helpText: PropTypes.string,
  readonly: PropTypes.bool,
  isInvalid: PropTypes.bool,
  controlName: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(DatepickerControl);
