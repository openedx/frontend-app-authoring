import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form, Icon } from '@edx/paragon';
import { Percent as PercentIcon } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

import FormikControl from '../../generic/FormikControl';

const PrereqSettings = ({
  values,
  setFieldValue,
  prereqs,
}) => {
  const intl = useIntl();
  const {
    isPrereq,
    prereqUsageKey,
    prereqMinScore,
    prereqMinCompletion,
  } = values;

  if (isPrereq === null) {
    return null;
  }

  const handleSelectChange = (e) => {
    setFieldValue('prereqUsageKey', e.target.value);
  };

  const prereqSelectionForm = () => (
    <>
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.limitAccessTitle} /></h5>
      <hr />
      <Form>
        <Form.Text><FormattedMessage {...messages.limitAccessDescription} /></Form.Text>
        <Form.Group controlId="prereqForm.select">
          <Form.Label>
            {intl.formatMessage(messages.prerequisiteSelectLabel)}
          </Form.Label>
          <Form.Control
            as="select"
            defaultValue={prereqUsageKey}
            onChange={handleSelectChange}
          >
            <option value="">
              {intl.formatMessage(messages.noPrerequisiteOption)}
            </option>
            {prereqs.map((prereqOption) => (
              <option
                key={prereqOption.blockUsageKey}
                value={prereqOption.blockUsageKey}
              >
                {prereqOption.blockDisplayName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        {prereqUsageKey && (
          <>
            <FormikControl
              name="prereqMinScore"
              value={prereqMinScore}
              label={<Form.Label>{intl.formatMessage(messages.minScoreLabel)}</Form.Label>}
              controlClassName="text-right"
              controlClasses="w-7rem"
              type="number"
              trailingElement={<Icon src={PercentIcon} />}
            />
            <FormikControl
              name="prereqMinCompletion"
              value={prereqMinCompletion}
              label={<Form.Label>{intl.formatMessage(messages.minCompletionLabel)}</Form.Label>}
              controlClassName="text-right"
              controlClasses="w-7rem"
              type="number"
              trailingElement={<Icon src={PercentIcon} />}
            />
          </>
        )}
      </Form>
    </>
  );

  const handleCheckboxChange = e => setFieldValue('isPrereq', e.target.checked);

  return (
    <>
      {prereqs.length > 0 && prereqSelectionForm()}
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.prereqTitle} /></h5>
      <hr />
      <Form.Checkbox checked={isPrereq} onChange={handleCheckboxChange}>
        <FormattedMessage {...messages.prereqCheckboxLabel} />
      </Form.Checkbox>
    </>
  );
};

PrereqSettings.propTypes = {
  values: PropTypes.shape({
    isPrereq: PropTypes.bool,
    prereqUsageKey: PropTypes.string,
    prereqMinScore: PropTypes.number,
    prereqMinCompletion: PropTypes.number,
  }).isRequired,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
  setFieldValue: PropTypes.func.isRequired,
};

const AdvancedTab = ({
  values,
  setFieldValue,
  prereqs,
}) => {
  const {
    isTimeLimited,
    defaultTimeLimitMinutes,
  } = values;

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

  const handleChange = (e) => {
    if (e.target.value === 'timed') {
      setFieldValue('isTimeLimited', true);
    } else {
      setFieldValue('isTimeLimited', false);
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
      <PrereqSettings
        values={values}
        setFieldValue={setFieldValue}
        prereqs={prereqs}
      />
    </>
  );
};

AdvancedTab.propTypes = {
  values: PropTypes.shape({
    isTimeLimited: PropTypes.bool.isRequired,
    defaultTimeLimitMinutes: PropTypes.number,
    isPrereq: PropTypes.bool,
    prereqUsageKey: PropTypes.string,
    prereqMinScore: PropTypes.number,
    prereqMinCompletion: PropTypes.number,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
};

export default injectIntl(AdvancedTab);
