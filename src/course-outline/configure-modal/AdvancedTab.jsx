import React, { useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useToggle, Form, Icon, SelectMenu, MenuItem } from '@edx/paragon';
import { Percent as PercentIcon } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const PrereqSettings = ({
  isPrereq,
  setIsPrereq,
  prereqs,
  prereq,
  prereqMinScore,
  prereqMinCompletion,
  setPrereqUsageKey,
  setPrereqMinScore,
  setPrereqMinCompletion,
}) => {
  const intl = useIntl();

  if (isPrereq === null) {
    return null;
  }

  const handleSelectChange = (e) => {
    setPrereqUsageKey(e.target.value);
  }
  const checkValueZeroToHundred = (val) => val >= 0 && val <= 100;

  const [scoreError, showScoreError, hideScoreError] = useToggle(false);
  const [completionError, showCompletionError, hideCompletionError] = useToggle(false);

  const handleMinScoreChange = (event) => {
    const { validity: { valid } } = event.target;
    let { value } = event.target;
    value = value.trim();
    if (valid) {
      if (value) {
        setPrereqMinScore(value)
      }
      hideScoreError();
    } else {
      showScoreError();
    }
  };
  const handleMinCompletionChange = (event) => {
    const { validity: { valid } } = event.target;
    let { value } = event.target;
    value = value.trim();
    if (valid) {
      if (value) {
        setPrereqMinCompletion(value)
      }
      hideCompletionError();
    } else {
      showCompletionError();
    }
  };

  const prereqSelectionForm = () => {
    return (
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
              defaultValue={prereq}
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
          {prereq &&
            <>
              <Form.Group
                isInvalid={scoreError}
                controlId="prereqForm.minScore"
              >
                <Form.Label>
                  {intl.formatMessage(messages.minScoreLabel)}
                </Form.Label>
                <Form.Control
                  className="w-60px"
                  controlClassName="text-right"
                  type="number"
                  trailingElement={<Icon src={PercentIcon} />}
                  value={prereqMinScore}
                  min="0"
                  max="100"
                  onChange={handleMinScoreChange}
                />
                {scoreError && <Form.Control.Feedback type="invalid">
                  {intl.formatMessage(messages.minScoreError)}
                </Form.Control.Feedback>}
              </Form.Group>
              <Form.Group
                isInvalid={completionError}
                controlId="prereqForm.minCompletion"
              >
                <Form.Label>
                  {intl.formatMessage(messages.minCompletionLabel)}
                </Form.Label>
                <Form.Control
                  className="w-60px"
                  controlClassName="text-right"
                  type="number"
                  trailingElement={<Icon src={PercentIcon} />}
                  value={prereqMinCompletion}
                  min="0"
                  max="100"
                  onChange={handleMinCompletionChange}
                />
                {completionError && <Form.Control.Feedback type="invalid">
                  {intl.formatMessage(messages.minCompletionError)}
                </Form.Control.Feedback>}
              </Form.Group>
            </>
          }
        </Form>
      </>
    );
  }

  const handleCheckboxChange = e => setIsPrereq(e.target.checked);

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

PrereqSettings.defaultProps = {
  isPrereq: null,
  prereqs: [],
  prereq: "",
  prereqMinScore: "100",
  prereqMinCompletion: "100",
  setPrereqUsageKey: null,
  setPrereqMinScore: null,
  setPrereqMinCompletion: null,
};

PrereqSettings.propTypes = {
  isPrereq: PropTypes.bool,
  setIsPrereq: PropTypes.func.isRequired,
  prereq: PropTypes.string,
  prereqMinScore: PropTypes.string,
  prereqMinCompletion: PropTypes.string,
  setPrereqUsageKey: PropTypes.func,
  setPrereqMinScore: PropTypes.func,
  setPrereqMinCompletion: PropTypes.func,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
};

const AdvancedTab = ({
  isTimeLimited,
  setIsTimeLimited,
  defaultTimeLimit,
  setDefaultTimeLimit,
  isPrereq,
  setIsPrereq,
  prereqs,
  prereq,
  prereqMinScore,
  prereqMinCompletion,
  setPrereqUsageKey,
  setPrereqMinScore,
  setPrereqMinCompletion,
}) => {
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

  const [timeLimit, setTimeLimit] = useState(formatHour(defaultTimeLimit));

  const handleChange = (e) => {
    if (e.target.value === 'timed') {
      setIsTimeLimited(true);
    } else {
      setDefaultTimeLimit(null);
      setIsTimeLimited(false);
    }
  };

  const setCurrentTimeLimit = (event) => {
    const { validity: { valid } } = event.target;
    let { value } = event.target;
    value = value.trim();
    if (value && valid) {
      const minutes = moment.duration(value).asMinutes();
      setDefaultTimeLimit(minutes);
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
        isPrereq={isPrereq}
        prereqs={prereqs}
        setIsPrereq={setIsPrereq}
        prereq={prereq}
        setPrereqUsageKey={setPrereqUsageKey}
        prereqMinScore={prereqMinScore}
        setPrereqMinScore={setPrereqMinScore}
        prereqMinCompletion={prereqMinCompletion}
        setPrereqMinCompletion={setPrereqMinCompletion}
      />
    </>
  );
};

AdvancedTab.defaultProps = {
  isPrereq: null,
  prereqs: [],
  prereq: "",
  prereqMinScore: "100",
  prereqMinCompletion: "100",
  setPrereqUsageKey: null,
  setPrereqMinScore: null,
  setPrereqMinCompletion: null,
};

AdvancedTab.propTypes = {
  isTimeLimited: PropTypes.bool.isRequired,
  setIsTimeLimited: PropTypes.func.isRequired,
  defaultTimeLimit: PropTypes.number.isRequired,
  setDefaultTimeLimit: PropTypes.func.isRequired,
  isPrereq: PropTypes.bool,
  setIsPrereq: PropTypes.func.isRequired,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
  prereq: PropTypes.string,
  prereqMinScore: PropTypes.string,
  prereqMinCompletion: PropTypes.string,
  setPrereqUsageKey: PropTypes.func,
  setPrereqMinScore: PropTypes.func,
  setPrereqMinCompletion: PropTypes.func,
};

export default injectIntl(AdvancedTab);
