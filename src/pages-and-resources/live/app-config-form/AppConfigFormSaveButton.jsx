import React, { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { StatefulButton } from '@edx/paragon';

import messages from '../messages';
import { SAVING } from '../data/slice';
import { AppConfigFormContext } from './AppConfigFormProvider';
import { useModel } from '../../../generic/model-store';

function AppConfigFormSaveButton({ intl, labelText }) {
  const saveStatus = useSelector(state => state.live.saveStatus);
  const { selectedAppId } = useSelector((state) => state.live);

  const app = useModel('apps', selectedAppId);
  const canSubmit = getAuthenticatedUser().administrator || !app.adminOnlyConfig;

  const { formRef } = useContext(AppConfigFormContext);

  const submitButtonState = saveStatus === SAVING ? 'pending' : 'default';

  // This causes the form to be submitted from a button outside the form.
  const handleSave = useCallback(() => {
    formRef.current.requestSubmit();
  }, [formRef]);

  return (
    canSubmit && (
      <StatefulButton
        labels={{
          default: labelText || intl.formatMessage(messages.saveButton),
          pending: intl.formatMessage(messages.savingButton),
          complete: intl.formatMessage(messages.savedButton),
        }}
        state={submitButtonState}
        onClick={handleSave}
        style={{ minWidth: '88px' }}
      />
    )
  );
}

AppConfigFormSaveButton.propTypes = {
  intl: intlShape.isRequired,
  labelText: PropTypes.string,
};

AppConfigFormSaveButton.defaultProps = {
  labelText: '',
};

export default injectIntl(AppConfigFormSaveButton);
