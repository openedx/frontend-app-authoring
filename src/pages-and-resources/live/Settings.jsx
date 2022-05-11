import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { camelCase } from 'lodash';
import { SelectableBox, Icon } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import * as Yup from 'yup';

import { fetchLiveData, saveLiveConfiguration, saveLiveConfigurationAsDraft } from './data/thunks';
import { selectApp } from './data/slice';
import FormikControl from '../../generic/FormikControl';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import { useModel } from '../../generic/model-store';
import Loading from '../../generic/Loading';
import iconsSrc from './constants';
import { RequestStatus } from '../../data/constants';
import messages from './messages';

function LiveSettings({
  intl,
  onClose,
}) {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true);
  const courseId = useSelector(state => state.courseDetail.courseId);
  const availableProviders = useSelector((state) => state.live.appIds);
  const {
    piiSharingAllowed, selectedAppId, enabled, status,
  } = useSelector(state => state.live);

  const appConfig = useModel('liveAppConfigs', selectedAppId);
  const app = useModel('liveApps', selectedAppId);

  const liveConfiguration = {
    enabled: enabled || false,
    consumerKey: appConfig?.consumerKey || '',
    consumerSecret: appConfig?.consumerSecret || '',
    launchUrl: appConfig?.launchUrl || '',
    launchEmail: appConfig?.launchEmail || '',
    provider: selectedAppId || 'zoom',
    piiSharingEnable: piiSharingAllowed || false,
    piiSharingUsername: app?.piiSharing.username || false,
    piiSharingEmail: app?.piiSharing.email || false,
  };

  const validationSchema = {
    enabled: Yup.boolean(),
    consumerKey: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
    consumerSecret: Yup.string().required(intl.formatMessage(messages.consumerSecretRequired)),
    launchUrl: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
    launchEmail: Yup.string().required(intl.formatMessage(messages.launchEmailRequired)),
  };

  const handleProviderChange = (providerId, setFieldValue, values) => {
    dispatch(saveLiveConfigurationAsDraft(values));
    dispatch(selectApp({ appId: providerId }));
    setFieldValue('provider', providerId);
  };

  const handleSettingsSave = async (values) => {
    await dispatch(saveLiveConfiguration(courseId, values));
  };

  useEffect(() => {
    (async () => {
      await dispatch(fetchLiveData(courseId));
      setLoading(false);
    })();
  }, [courseId]);

  return (
    <>
      <AppSettingsModal
        appId="live"
        title={intl.formatMessage(messages.heading)}
        enableAppHelp={intl.formatMessage(messages.enableLiveHelp)}
        enableAppLabel={intl.formatMessage(messages.enableLiveLabel)}
        learnMoreText={intl.formatMessage(messages.enableLiveLink)}
        onClose={onClose}
        initialValues={liveConfiguration}
        validationSchema={validationSchema}
        onSettingsSave={handleSettingsSave}
        configureBeforeEnable
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <>
            {(status === RequestStatus.IN_PROGRESS || isLoading) ? (
              <Loading />
              ) : (
                <>
                  <h4 className="my-3">{intl.formatMessage(messages.selectProvider)}</h4>
                  <SelectableBox.Set
                    type="checkbox"
                    value={values.provider}
                    onChange={(event) => handleProviderChange(event.target.value, setFieldValue, values)}
                    name="provider"
                    columns={3}
                    className="mb-3"
                  >
                    {availableProviders.map((provider) => (
                      <SelectableBox value={provider} type="checkbox" key={provider}>
                        <div className="d-flex flex-column align-items-center">
                          <Icon src={iconsSrc[`${camelCase(provider)}`]} alt={provider} />
                          <span>{intl.formatMessage(messages[`appName-${camelCase(provider)}`])}</span>
                        </div>
                      </SelectableBox>
                    ))}
                  </SelectableBox.Set>
                  {(!values.piiSharingEnable && (values.piiSharingEmail || values.piiSharingUsername)) ? (
                    <p data-testid="request-pii-sharing">
                      {intl.formatMessage(messages.requestPiiSharingEnable, { provider: values.provider })}
                    </p>
                  ) : (
                    <>
                      {(values.piiSharingEmail || values.piiSharingUsername)
                        && (
                        <p data-testid="helper-text">
                          {intl.formatMessage(messages.providerHelperText, { providerName: values.provider })}
                        </p>
                      )}
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
                    </>
                  )}
                </>
              )}
          </>
          )}
      </AppSettingsModal>
    </>
  );
}

LiveSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(LiveSettings);
