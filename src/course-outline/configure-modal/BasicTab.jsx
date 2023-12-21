import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@edx/paragon';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { DatepickerControl, DATEPICKER_TYPES } from '../../generic/datepicker-control';

const BasicTab = ({ releaseDate, setReleaseDate }) => {
  const intl = useIntl();
  const onChange = (value) => {
    setReleaseDate(value);
  };

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
          onChange={(date) => onChange(date)}
        />
        <DatepickerControl
          type={DATEPICKER_TYPES.time}
          value={releaseDate}
          label={intl.formatMessage(messages.releaseTimeUTC)}
          controlName="start-time"
          onChange={(date) => onChange(date)}
        />
      </Stack>
    </>
  );
};

BasicTab.propTypes = {
  releaseDate: PropTypes.string.isRequired,
  setReleaseDate: PropTypes.func.isRequired,
};

export default injectIntl(BasicTab);
