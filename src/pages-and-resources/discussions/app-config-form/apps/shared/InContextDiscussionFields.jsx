import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from '../../messages';
import AppConfigFormDivider from './AppConfigFormDivider';

function InContextDiscussionFields({
  onBlur,
  onChange,
  intl,
  values,
}) {
  return (
    <>
      <h5 className="text-gray-500 mt-4">{intl.formatMessage(messages.visibilityInContext)}</h5>
      <FormSwitchGroup
        onChange={onChange}
        onBlur={onBlur}
        id="enableGradedUnits"
        checked={values.enableGradedUnits}
        label={intl.formatMessage(messages.gradedUnitPagesLabel)}
        helpText={intl.formatMessage(messages.gradedUnitPagesHelp)}
      />
      <AppConfigFormDivider />
      <FormSwitchGroup
        onChange={onChange}
        onBlur={onBlur}
        id="groupAtSubsection"
        checked={values.groupAtSubsection}
        label={intl.formatMessage(messages.groupInContextSubsectionLabel)}
        helpText={intl.formatMessage(messages.groupInContextSubsectionHelp)}
      />
    </>
  );
}

InContextDiscussionFields.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  values: PropTypes.shape({
    enableGradedUnits: PropTypes.bool,
    groupAtSubsection: PropTypes.bool,
  }).isRequired,
};

export default injectIntl(InContextDiscussionFields);
