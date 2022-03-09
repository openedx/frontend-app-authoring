import React from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CardGrid } from '@edx/paragon';
import AppCard from './AppCard';
import FormikControl from '../../generic/FormikControl';
import { useAppSetting } from '../../utils';
import AppExternalLinks from '../discussions/app-config-form/apps/shared/AppExternalLinks';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';

function LiveSettings({
  intl,
  onClose,
}) {
  const [liveConfiguration, saveSettings] = useAppSetting('liveConfiguration');

  const handleSettingsSave = async (values) => {
    saveSettings(values);
  };

  const selectProvider = () => {};

  return (
    <AppSettingsModal
      appId="live"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableLiveHelp)}
      enableAppLabel={intl.formatMessage(messages.enableLiveLabel)}
      learnMoreText={intl.formatMessage(messages.enableLiveLink)}
      onClose={onClose}
      initialValues={{
        consumerKey: liveConfiguration?.consumerKey || '',
        consumerSecret: liveConfiguration?.consumerSecret || '',
        launchUrl: liveConfiguration?.launchUrl || '',
        launchEmail: liveConfiguration?.launchEmail || '',
        piiShareUsername: liveConfiguration?.piiSharing ? liveConfiguration.piiShareUsername : undefined,
        piiShareEmail: liveConfiguration?.piiSharing ? liveConfiguration.piiShareEmail : undefined,
      }}
      validationSchema={{
        enabled: Yup.boolean(),
        consumerKey: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
        consumerSecret: Yup.string().required(intl.formatMessage(messages.consumerSecretRequired)),
        launchUrl: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
        launchEmail: Yup.string().required(intl.formatMessage(messages.launchEmailRequired)),
      }}
      onSettingsSave={handleSettingsSave}
      configureBeforeEnable
    >
      {
        ({ values }) => (
          <>
            <h4 className="my-3">{intl.formatMessage(messages.selectProvider)}</h4>
            <CardGrid
              columnSizes={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              {[{ id: 'Zoom' }].map((app) => (
                <AppCard app={app} selected={app.id === 'Zoom'} onClick={selectProvider} key={app.id} />
              ))}
            </CardGrid>
            <p>{intl.formatMessage(messages.providerHelperText, { providerName: 'Zoom' })}</p>
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
              type="input"
            />
            <FormikControl
              name="launchUrl"
              value={values.launchUrl}
              floatingLabel={intl.formatMessage(messages.launchUrl)}
              className="pb-1"
              type="input"
            />
            <FormikControl
              name="launchEmail"
              value={values.launchEmail}
              floatingLabel={intl.formatMessage(messages.launchEmail)}
              type="input"
            />
            <AppExternalLinks
              externalLinks={{
                learnMore: '',
                configuration: '',
                general: 'https://edstem.org/us/',
                accessibility: '',
                contactEmail: '',
              }}
              providerName="live"
              showLaunchIcon
            />
          </>
        )
      }
    </AppSettingsModal>
  );
}

LiveSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(LiveSettings);
