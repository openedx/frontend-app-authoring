import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const timeLimits = Array.from({ length: 48 }, (_, i) => 30 + 30 * i);

const AdvancedTab = ({
  isTimeLimited,
  setIsTimeLimited,
  defaultTimeLimit,
  setDefaultTimeLimit,
}) => {
  const handleChange = (e) => {
    if (e.target.value === 'timed') {
      setIsTimeLimited(true);
    } else {
      setDefaultTimeLimit(null);
      setIsTimeLimited(false);
    }
  };

  const setSelected = (valueString) => {
    const value = valueString.split(':');
    setDefaultTimeLimit(Number.parseInt(value[0], 10) * 60 + Number.parseInt(value[1], 10));
  };

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
    return `${hhs}:${mms}`;
  };

  const generateTimeLimits = () => timeLimits.map(
    (hour) => (
      <Form.AutosuggestOption>
        {formatHour(hour)}
      </Form.AutosuggestOption>
    ),
  );

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
        <>
          <h6 className="mt-4 text-gray-700"><FormattedMessage {...messages.timeAllotted} /></h6>
          <Form.Autosuggest
            value={defaultTimeLimit === null ? formatHour(timeLimits[0]) : formatHour(defaultTimeLimit)}
            onSelected={(value) => setSelected(value)}
            data-testid="hour-autosuggest"
          >
            {generateTimeLimits()}
          </Form.Autosuggest>
          <Form.Text><FormattedMessage {...messages.timeLimitDescription} /></Form.Text>
        </>
      )}
    </>
  );
};

AdvancedTab.propTypes = {
  releaseDate: PropTypes.string.isRequired,
  setReleaseDate: PropTypes.func.isRequired,
  isTimeLimited: PropTypes.bool.isRequired,
  setIsTimeLimited: PropTypes.func.isRequired,
  defaultTimeLimit: PropTypes.string.isRequired,
  setDefaultTimeLimit: PropTypes.func.isRequired,
};

export default injectIntl(AdvancedTab);
