import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

import FormSwitchGroup from '../../generic/FormSwitchGroup';
import { useAppSetting } from '../../utils';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';

function ProgressSettings({ intl, onClose }) {
  const [disableProgressGraph, saveSetting] = useAppSetting('disableProgressGraph');

  const handleSettingsSave = (values) => saveSetting(!values.enableProgressGraph);

  return (
    <AppSettingsModal
      appId="progress"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableProgressHelp)}
      enableAppLabel={intl.formatMessage(messages.enableProgressLabel)}
      learnMoreText={intl.formatMessage(messages.enableProgressLink)}
      onClose={onClose}
      initialValues={{ enableProgressGraph: !disableProgressGraph }}
      validationSchema={{ enableProgressGraph: Yup.boolean() }}
      onSettingsSave={handleSettingsSave}
    >
      {
        ({ handleChange, handleBlur, values }) => {
          let formSwitch = null;
          if (process.env.ENABLE_PROGRESS_GRAPH_SETTINGS === 'true') {
            formSwitch = (
              <FormSwitchGroup
                id="enable-progress-graph"
                name="enableProgressGraph"
                label={intl.formatMessage(messages.enableGraphLabel)}
                helpText={intl.formatMessage(messages.enableGraphHelp)}
                onChange={handleChange}
                onBlur={handleBlur}
                checked={values.enableProgressGraph}
              />
            );
          }
          return formSwitch;
        }
      }
    </AppSettingsModal>
  );
}

ProgressSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(ProgressSettings);
