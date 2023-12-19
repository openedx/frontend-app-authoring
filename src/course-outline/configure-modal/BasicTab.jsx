import React from 'react';
import PropTypes from 'prop-types';
import { Stack, Form } from '@edx/paragon';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { DatepickerControl, DATEPICKER_TYPES } from '../../generic/datepicker-control';

const BasicTab = ({
  releaseDate,
  setReleaseDate,
  isSubsection,
  graderType,
  courseGraders,
  setGraderType,
  dueDate,
  setDueDate,
}) => {
  const intl = useIntl();
  const onChangeReleaseDate = (value) => {
    setReleaseDate(value);
  };

  const onChangeGraderType = (e) => {
    const { value } = e.target;
    return value === 'Not Graded' ? setGraderType('notgraded') : setGraderType(value);
  };

  const onChangeDueDate = (value) => {
    setDueDate(value);
  };

  const createOptions = () => courseGraders.map((option) => (
    <option> {option} </option>
  ));

  return (
    <>
      <h3 className="mt-3"><FormattedMessage {...messages.releaseDateAndTime} /></h3>
      <hr />
      <Stack direction="horizontal" gap={5}>
        <DatepickerControl
          type={DATEPICKER_TYPES.date}
          value={releaseDate}
          label={intl.formatMessage(messages.releaseDate)}
          controlName="state-date"
          onChange={(date) => onChangeReleaseDate(date)}
        />
        <DatepickerControl
          type={DATEPICKER_TYPES.time}
          value={releaseDate}
          label={intl.formatMessage(messages.releaseTimeUTC)}
          controlName="start-time"
          onChange={(date) => onChangeReleaseDate(date)}
        />
      </Stack>
      {
        isSubsection ? (
          <div>
            <h3 className="mt-3"><FormattedMessage {...messages.grading} /></h3>
            <hr />
            <Form.Label><FormattedMessage {...messages.gradeAs} /></Form.Label>
            <Form.Control
              as="select"
              defaultValue={graderType}
              onChange={(value) => onChangeGraderType(value)}
              data-testid="grader-type-select"
            >
              <option> Not Graded </option>
              {createOptions()}
            </Form.Control>
            <Stack direction="horizontal" gap={5}>
              <DatepickerControl
                type={DATEPICKER_TYPES.date}
                value={dueDate}
                label={intl.formatMessage(messages.dueDate)}
                controlName="state-date"
                onChange={(date) => onChangeDueDate(date)}
              />
              <DatepickerControl
                type={DATEPICKER_TYPES.time}
                value={dueDate}
                label={intl.formatMessage(messages.dueTimeUTC)}
                controlName="start-time"
                onChange={(date) => onChangeDueDate(date)}
              />
            </Stack>
          </div>
        ) : <div />
      }
    </>
  );
};

BasicTab.propTypes = {
  releaseDate: PropTypes.string.isRequired,
  setReleaseDate: PropTypes.func.isRequired,
  isSubsection: PropTypes.bool.isRequired,
  graderType: PropTypes.string.isRequired,
  setGraderType: PropTypes.func.isRequired,
  dueDate: PropTypes.string.isRequired,
  setDueDate: PropTypes.func.isRequired,
  courseGraders: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default injectIntl(BasicTab);
