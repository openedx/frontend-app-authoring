import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, Form, Dropdown } from '@openedx/paragon';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';

import { DatepickerControl, DATEPICKER_TYPES } from '../datepicker-control';
import messages from './messages';

const BasicTab = ({
  values,
  setFieldValue,
  courseGraders,
  isSubsection,
  isSelfPaced,
}) => {
  const intl = useIntl();
  const [graderDropdownOpen, setGraderDropdownOpen] = useState(false);

  const {
    releaseDate,
    graderType,
    dueDate,
  } = values;

  const onChangeGraderType = (value) => {
    setFieldValue('graderType', value);
    setGraderDropdownOpen(false);
  };

  const getGraderDisplayValue = () => {
    if (graderType === 'notgraded') {
      return intl.formatMessage(messages.notGradedTypeOption);
    }
    return graderType;
  };

  return (
    <>
      {!isSelfPaced && (
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
                onChange={(val) => setFieldValue('releaseDate', val)}
              />
              <DatepickerControl
                type={DATEPICKER_TYPES.time}
                value={releaseDate}
                label={intl.formatMessage(messages.releaseTimeCustom)}
                controlName="start-time"
                onChange={(val) => setFieldValue('releaseDate', val)}
              />
            </Stack>
          </div>
        </>
      )}
      {
        isSubsection && (
          <div>
            <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.grading} /></h5>
            <hr />
            <Form.Group>
              <Form.Label><FormattedMessage {...messages.gradeAs} /></Form.Label>
              <Dropdown 
                show={graderDropdownOpen} 
                onToggle={setGraderDropdownOpen}
                className="titaned-grader-dropdown-wrapper"
              >
                <Dropdown.Toggle 
                  variant="outline-primary" 
                  className="titaned-grader-dropdown-toggle"
                  data-testid="grader-type-select"
                >
                  {getGraderDisplayValue()}
                </Dropdown.Toggle>
                <Dropdown.Menu className="titaned-grader-dropdown-menu">
                  <Dropdown.Item 
                    onClick={() => onChangeGraderType('notgraded')}
                    className="titaned-grader-dropdown-item"
                  >
                    {intl.formatMessage(messages.notGradedTypeOption)}
                  </Dropdown.Item>
                  {courseGraders.map((option) => (
                    <Dropdown.Item 
                      key={option} 
                      onClick={() => onChangeGraderType(option)}
                      className="titaned-grader-dropdown-item"
                    >
                      {option}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            {!isSelfPaced && (
              <div data-testid="due-date-stack">
                <Stack className="mt-3" direction="horizontal" gap={5}>
                  <DatepickerControl
                    type={DATEPICKER_TYPES.date}
                    value={dueDate}
                    label={intl.formatMessage(messages.dueDate)}
                    controlName="state-date"
                    onChange={(val) => setFieldValue('dueDate', val)}
                    data-testid="due-date-picker"
                  />
                  <DatepickerControl
                    type={DATEPICKER_TYPES.time}
                    value={dueDate}
                    label={intl.formatMessage(messages.dueTimeCustom)}
                    controlName="start-time"
                    onChange={(val) => setFieldValue('dueDate', val)}
                  />
                </Stack>
              </div>
            )}
          </div>
        )
      }
    </>
  );
};

BasicTab.propTypes = {
  isSubsection: PropTypes.bool.isRequired,
  values: PropTypes.shape({
    releaseDate: PropTypes.string.isRequired,
    graderType: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
  }).isRequired,
  courseGraders: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  isSelfPaced: PropTypes.bool.isRequired,
};

export default injectIntl(BasicTab);
