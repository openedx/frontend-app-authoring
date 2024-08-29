import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { camelCase } from 'lodash';
import { Icon } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import SelectableBox from 'CourseAuthoring/editors/sharedComponents/SelectableBox';
import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import { useModel } from 'CourseAuthoring/generic/model-store';
import Loading from 'CourseAuthoring/generic/Loading';
import { RequestStatus } from 'CourseAuthoring/data/constants';

import { fetchLiveData, saveLiveConfiguration, saveLiveConfigurationAsDraft } from './data/thunks';
import { selectApp } from './data/slice';
import { iconsSrc, bbbPlanTypes } from './constants';
import messages from './messages';
import ZoomSettings from './ZoomSettings';
import BBBSettings from './BBBSettings';

const LiveSettings = ({
  intl,
  onClose,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    piiSharingUsername: app?.piiSharing?.username || false,
    piiSharingEmail: app?.piiSharing?.email || false,
    tierType: appConfig?.tierType || '',
  };

  const validationSchema = {
    enabled: Yup.boolean(),
    consumerKey: Yup.string().when(['provider', 'tierType'], {
      is: (provider, tier) => provider === 'zoom' || (provider === 'big_blue_button' && tier === bbbPlanTypes.commercial),
      then: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
    }),
    consumerSecret: Yup.string().when(['provider', 'tierType'], {
      is: (provider, tier) => provider === 'zoom' || (provider === 'big_blue_button' && tier === bbbPlanTypes.commercial),
      then: Yup.string().notRequired(intl.formatMessage(messages.consumerSecretRequired)),
    }),
    launchUrl: Yup.string().when(['provider', 'tierType'], {
      is: (provider, tier) => provider === 'zoom' || (provider === 'big_blue_button' && tier === bbbPlanTypes.commercial),
      then: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
    }),
    launchEmail: Yup.string(),
  };

  const handleProviderChange = (providerId, setFieldValue, values) => {
    dispatch(saveLiveConfigurationAsDraft(values));
    dispatch(selectApp({ appId: providerId }));
    setFieldValue('provider', providerId);
  };

  const handleSettingsSave = async (values) => {
    await dispatch(saveLiveConfiguration(courseId, values, navigate));
  };

  useEffect(() => {
    dispatch(fetchLiveData(courseId));
  }, [courseId]);

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
      {({ values, setFieldValue }) => (
        (status === RequestStatus.IN_PROGRESS) ? (
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
            {values.provider === 'zoom' ? <ZoomSettings values={values} />
              : (
                <BBBSettings
                  values={values}
                  setFieldValue={setFieldValue}
                />
              )}
          </>
        )
      )}
    </AppSettingsModal>
  );
};

LiveSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(LiveSettings);
