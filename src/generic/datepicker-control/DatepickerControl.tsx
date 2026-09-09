import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { Form, Icon } from '@openedx/paragon';
import { AccessTime, Calendar } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { convertToDateFromString, convertToStringFromDate, isValidDate } from '../../utils';
import { DATE_FORMAT, TIME_FORMAT } from '../../constants';
import messages from './messages';

export const DATEPICKER_TYPES = {
  date: 'date',
  time: 'time',
} as const;

type DatepickerType = typeof DATEPICKER_TYPES[keyof typeof DATEPICKER_TYPES];

interface Props {
  type: DatepickerType;
  label: string;
  value?: string;
  showUTC?: boolean;
  readonly?: boolean;
  helpText?: string;
  isInvalid?: boolean;
  controlName: string;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DatepickerControl = ({
  type,
  label,
  value = '',
  showUTC = false,
  readonly = false,
  helpText = '',
  isInvalid = false,
  controlName,
  onChange,
  minDate,
  maxDate,
}: Props) => {
  const intl = useIntl();
  const formattedDate = convertToDateFromString(value);
  const inputFormat = {
    [DATEPICKER_TYPES.date]: DATE_FORMAT,
    [DATEPICKER_TYPES.time]: TIME_FORMAT,
  };
  const isTimePicker = type === DATEPICKER_TYPES.time;

  let describedByIds;
  if (isTimePicker) {
    const ids = [`${controlName}-timehint`];
    if (helpText) {
      ids.push(`${controlName}-helptext`);
    }
    describedByIds = ids.filter(Boolean).join(' ') || undefined;
  } else if (helpText) {
    describedByIds = `${controlName}-helptext`;
  }

  return (
    <Form.Group controlId={controlName} className="form-group-custom datepicker-custom">
      <Form.Label className="d-flex justify-content-between">
        {label}
        {showUTC && (
          <span className="h6 font-weight-normal text-gray-500 mb-0">
            ({intl.formatMessage(messages.datepickerUTC)})
          </span>
        )}
      </Form.Label>
      <div className="position-relative">
        {type === DATEPICKER_TYPES.date && !readonly && (
          <Icon
            src={Calendar}
            className="datepicker-custom-control-icon"
            screenReaderText={intl.formatMessage(messages.calendarAltText)}
          />
        )}
        {type === DATEPICKER_TYPES.time && (
          <Icon
            src={AccessTime}
            className="datepicker-custom-control-icon"
            screenReaderText={intl.formatMessage(messages.timeAltText)}
          />
        )}
        <DatePicker
          id={controlName}
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
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={type === DATEPICKER_TYPES.time}
          showTimeSelectOnly={type === DATEPICKER_TYPES.time}
          placeholderText={inputFormat[type].toLocaleUpperCase()}
          showPopperArrow={false}
          aria-describedby={describedByIds}
          onChange={(date) => {
            if (isValidDate(date)) {
              onChange(convertToStringFromDate(date));
            }
          }}
        />
      </div>
      {isTimePicker && (
        <Form.Text id={`${controlName}-timehint`} className="sr-only">
          {intl.formatMessage(messages.timepickerScreenreaderHint, {
            timeFormat: inputFormat[type].toLocaleUpperCase(),
          })}
        </Form.Text>
      )}
      {helpText && (
        <Form.Control.Feedback id={`${controlName}-helptext`}>
          {helpText}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default DatepickerControl;
