import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import { useAppSetting } from 'CourseAuthoring/utils';
import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import messages from './messages';

const WikiSettings = ({ intl, onClose }) => {
  const [enablePublicWiki, saveSetting] = useAppSetting('allowPublicWikiAccess');
  const handleSettingsSave = (values) => saveSetting(values.enablePublicWiki);

  return (
    <AppSettingsModal
      appId="wiki"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableWikiHelp)}
      enableAppLabel={intl.formatMessage(messages.enableWikiLabel)}
      learnMoreText={intl.formatMessage(messages.enableWikiLink)}
      onClose={onClose}
      initialValues={{ enablePublicWiki }}
      validationSchema={{ enablePublicWiki: Yup.boolean() }}
      onSettingsSave={handleSettingsSave}
    >
      {
        ({ values, handleChange, handleBlur }) => (
          <FormSwitchGroup
            id="enable-public-wiki"
            name="enablePublicWiki"
            label={intl.formatMessage(messages.enablePublicWikiLabel)}
            helpText={intl.formatMessage(messages.enablePublicWikiHelp)}
            onChange={handleChange}
            onBlue={handleBlur}
            checked={values.enablePublicWiki}
          />
        )
      }
    </AppSettingsModal>
  );
};

WikiSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(WikiSettings);
