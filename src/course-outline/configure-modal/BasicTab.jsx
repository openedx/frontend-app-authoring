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

  const onChangeGraderType = (e) => setGraderType(e.target.value);

  const createOptions = () => courseGraders.map((option) => (
    <option key={option} value={option}> {option} </option>
  ));

  return (
    <>
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.releaseDateAndTime} /></h5>
      <hr />
      <div data-testid="release-date-stack">
        <Stack className="mt-3" direction="horizontal" gap={5}>
          <DatepickerControl
            type={DATEPICKER_TYPES.date}
            value={releaseDate}
            label={intl.formatMessage(messages.releaseDate)}
            controlName="state-date"
            onChange={setReleaseDate}
          />
          <DatepickerControl
            type={DATEPICKER_TYPES.time}
            value={releaseDate}
            label={intl.formatMessage(messages.releaseTimeUTC)}
            controlName="start-time"
            onChange={setReleaseDate}
          />
        </Stack>
      </div>
      {
        isSubsection && (
          <div>
            <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.grading} /></h5>
            <hr />
            <Form.Label><FormattedMessage {...messages.gradeAs} /></Form.Label>
            <Form.Control
              as="select"
              defaultValue={graderType}
              onChange={(value) => onChangeGraderType(value)}
              data-testid="grader-type-select"
            >
              <option key="notGraded" value="Not Graded"> Not Graded </option>
              {createOptions()}
            </Form.Control>
            <div data-testid="due-date-stack">
              <Stack className="mt-3" direction="horizontal" gap={5}>
                <DatepickerControl
                  type={DATEPICKER_TYPES.date}
                  value={dueDate}
                  label={intl.formatMessage(messages.dueDate)}
                  controlName="state-date"
                  onChange={setDueDate}
                  data-testid="due-date-picker"
                />
                <DatepickerControl
                  type={DATEPICKER_TYPES.time}
                  value={dueDate}
                  label={intl.formatMessage(messages.dueTimeUTC)}
                  controlName="start-time"
                  onChange={setDueDate}
                />
              </Stack>
            </div>
          </div>
        )
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
