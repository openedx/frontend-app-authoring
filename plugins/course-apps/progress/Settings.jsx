import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import * as Yup from 'yup';
import { getConfig } from '@edx/frontend-platform';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import { useAppSetting } from 'CourseAuthoring/utils';
import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import messages from './messages';

const ProgressSettings = ({ intl, onClose }) => {
  const [disableProgressGraph, saveSetting] = useAppSetting('disableProgressGraph');
  const showProgressGraphSetting = getConfig().ENABLE_PROGRESS_GRAPH_SETTINGS.toString().toLowerCase() === 'true';

  const handleSettingsSave = async (values) => {
    if (showProgressGraphSetting) { await saveSetting(!values.enableProgressGraph); }
  };

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
        ({ handleChange, handleBlur, values }) => (
          showProgressGraphSetting && (
            <FormSwitchGroup
              id="enable-progress-graph"
              name="enableProgressGraph"
              label={intl.formatMessage(messages.enableGraphLabel)}
              helpText={intl.formatMessage(messages.enableGraphHelp)}
              onChange={handleChange}
              onBlur={handleBlur}
              checked={values.enableProgressGraph}
            />
          )
        )
      }
    </AppSettingsModal>
  );
};

ProgressSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(ProgressSettings);
