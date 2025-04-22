import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import FormikControl from 'CourseAuthoring/generic/FormikControl';

import messages from './messages';

const LiveCommonFields = ({
  values,
}) => {
  const intl = useIntl();
  return (
    <>
      <p className="pb-2">{intl.formatMessage(messages.formInstructions)}</p>
      <FormikControl
        name="consumerKey"
        value={values.consumerKey}
        floatingLabel={intl.formatMessage(messages.consumerKey)}
        className="pb-1"
        type="input"
      />
      <FormikControl
        name="consumerSecret"
        value={values.consumerSecret}
        floatingLabel={intl.formatMessage(messages.consumerSecret)}
        className="pb-1"
        type="password"
      />
      <FormikControl
        name="launchUrl"
        value={values.launchUrl}
        floatingLabel={intl.formatMessage(messages.launchUrl)}
        className="pb-1"
        type="input"
      />
    </>
  );
};

LiveCommonFields.propTypes = {
  values: PropTypes.shape({
    consumerKey: PropTypes.string,
    consumerSecret: PropTypes.string,
    launchUrl: PropTypes.string,
    launchEmail: PropTypes.string,
  }).isRequired,
};

export default LiveCommonFields;
