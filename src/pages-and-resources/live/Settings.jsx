import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { camelCase } from 'lodash';
import { SelectableBox, Icon } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { fetchLiveData, saveLiveConfiguration } from './data/thunks';
import FormikControl from '../../generic/FormikControl';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import iconsSrc from './constants';
import messages from './messages';

function LiveSettings({
  intl,
  onClose,
}) {
  const dispatch = useDispatch();
  const courseId = useSelector(state => state.courseDetail.courseId);
  const liveConfiguration = useSelector((state) => state.live.configuration);
  const availableProviders = useSelector((state) => state.live.appIds);

  useEffect(() => {
    dispatch(fetchLiveData(courseId));
  }, [courseId]);

  const validationSchema = {
    enabled: Yup.boolean(),
    consumerKey: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
    consumerSecret: Yup.string().required(intl.formatMessage(messages.consumerSecretRequired)),
    launchUrl: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
    launchEmail: Yup.string().required(intl.formatMessage(messages.launchEmailRequired)),
  };

  const handleSettingsSave = async (values) => {
    await dispatch(saveLiveConfiguration(courseId, values));
  };
  const handleProviderChange = (selectedProvider, setFieldValue) => {
    setFieldValue('provider', selectedProvider);
  };

  return (
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
      {
        ({ values, setFieldValue }) => (
          <>
            <h4 className="my-3">{intl.formatMessage(messages.selectProvider)}</h4>
            <SelectableBox.Set
              type="checkbox"
              value={values.provider}
              onChange={(event) => handleProviderChange(event.target.value, setFieldValue)}
              name="provider"
              columns={3}
              className="mb-3"
            >
              {availableProviders.map((app) => (
                <SelectableBox value={app.id} type="checkbox" key={app.id}>
                  <div className="d-flex flex-column align-items-center">
                    <Icon src={iconsSrc[`${camelCase(app.id)}`]} alt={app.id} />
                    <span>{intl.formatMessage(messages[`appName-${camelCase(app.id)}`])}</span>
                  </div>
                </SelectableBox>
              ))}
            </SelectableBox.Set>
            <p data-testid="helper-text">
              {intl.formatMessage(messages.providerHelperText, { providerName: values.provider })}
            </p>
            {values.piiSharingEnable ? (
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
            ) : (
              <p data-testid="request-pii-sharing">
                {intl.formatMessage(messages.requestPiiSharingEnable, { provider: values.provider })}
              </p>
            )}
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
