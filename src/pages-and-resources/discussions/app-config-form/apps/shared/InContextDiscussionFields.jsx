import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useFormikContext } from 'formik';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from '../../messages';
import AppConfigFormDivider from './AppConfigFormDivider';
import ConfirmationPopup from '../../../../../generic/ConfirmationPopup';

const InContextDiscussionFields = ({
  onBlur,
  onChange,
  intl,
  values,
}) => {
  const {
    setFieldValue,
  } = useFormikContext();

  const [showPopup, setShowPopup] = useState(false);
  const handleConfirmation = () => {
    setFieldValue('enableGradedUnits', !values.enableGradedUnits);
    setShowPopup(false);
  };

  return (
    <>
      <h5 className="text-gray-500 mt-4">{intl.formatMessage(messages.visibilityInContext)}</h5>
      {showPopup
        ? (
          <ConfirmationPopup
            label={values.enableGradedUnits
              ? intl.formatMessage(messages.cancelEnableDiscussionsLabel)
              : intl.formatMessage(messages.confirmEnableDiscussionsLabel)}
            bodyText={values.enableGradedUnits
              ? intl.formatMessage(messages.cancelEnableDiscussions)
              : intl.formatMessage(messages.confirmEnableDiscussions)}
            onConfirm={handleConfirmation}
            confirmLabel={intl.formatMessage(messages.confirm)}
            onCancel={() => setShowPopup(false)}
            cancelLabel={intl.formatMessage(messages.cancelButton)}
          />
        )
        : (
          <FormSwitchGroup
            onChange={() => setShowPopup(true)}
            onBlur={onBlur}
            id="enableGradedUnits"
            checked={values.enableGradedUnits}
            label={intl.formatMessage(messages.gradedUnitPagesLabel)}
            helpText={intl.formatMessage(messages.gradedUnitPagesHelp)}
          />
        )}
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
};

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
