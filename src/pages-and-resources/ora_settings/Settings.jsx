import React from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Hyperlink } from '@edx/paragon';
import { useModel } from '../../generic/model-store';

import FormSwitchGroup from '../../generic/FormSwitchGroup';
import { useAppSetting } from '../../utils';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';

const ORASettings = ({ intl, onClose }) => {
  const appId = 'ora_settings';
  const appInfo = useModel('courseApps', appId);
  const [enableFlexiblePeerGrade, saveSetting] = useAppSetting(
    'forceOnFlexiblePeerOpenassessments',
  );
  const handleSettingsSave = (values) => saveSetting(values.enableFlexiblePeerGrade);

  const title = (
    <div>
      <p>{intl.formatMessage(messages.heading)}</p>
      <div className="pt-3">
        <Hyperlink
          className="text-primary-500 small"
          destination={appInfo.documentationLinks?.learnMoreConfiguration}
          target="_blank"
          rel="noreferrer noopener"
        >
          {intl.formatMessage(messages.ORASettingsHelpLink)}
        </Hyperlink>
      </div>
    </div>
  );

  return (
    <AppSettingsModal
      appId={appId}
      title={title}
      onClose={onClose}
      initialValues={{ enableFlexiblePeerGrade }}
      validationSchema={{ enableFlexiblePeerGrade: Yup.boolean() }}
      onSettingsSave={handleSettingsSave}
      hideAppToggle
    >
      {({ values, handleChange, handleBlur }) => (
        <FormSwitchGroup
          id="enable-flexible-peer-grade"
          name="enableFlexiblePeerGrade"
          label={intl.formatMessage(messages.enableFlexPeerGradeLabel)}
          helpText={intl.formatMessage(messages.enableFlexPeerGradeHelp)}
          onChange={handleChange}
          onBlur={handleBlur}
          checked={values.enableFlexiblePeerGrade}
        />
      )}
    </AppSettingsModal>
  );
};

ORASettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(ORASettings);
