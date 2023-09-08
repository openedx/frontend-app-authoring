import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { camelCase } from 'lodash';
import { SelectableBox, Icon, StatefulButton } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import {
  configureZoomGlobalSettings,
  fetchLiveData, saveLiveConfiguration,
  saveLiveConfigurationAsDraft,
} from './data/thunks';
import { selectApp, updateIsZoomGlobalCredSet } from './data/slice';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import { useModel } from '../../generic/model-store';
import Loading from '../../generic/Loading';
import { iconsSrc, bbbPlanTypes } from './constants';
import { RequestStatus } from '../../data/constants';
import messages from './messages';
import ZoomSettings from './ZoomSettings';
import BBBSettings from './BBBSettings';

const LiveSettings = ({
  intl,
  onClose,
}) => {
  const [isZoomBtnClicked, setIsZoomBtnClicked] = useState(false);
  const dispatch = useDispatch();
  const courseId = useSelector(state => state.courseDetail.courseId);
  const availableProviders = useSelector((state) => state.live.appIds);
  const isZoomGlobalCredSet = useSelector((state) => state.live.isZoomGlobalCredSet);
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
    await dispatch(saveLiveConfiguration(courseId, values));
  };

  const configureZoomGlobalSettingsIfExists = async (id) => {
    await dispatch(configureZoomGlobalSettings(id));
  };

  useEffect(() => {
    if (!isZoomGlobalCredSet && isZoomBtnClicked) {
      configureZoomGlobalSettingsIfExists(courseId);
      setIsZoomBtnClicked(false);
      dispatch(updateIsZoomGlobalCredSet({ isZoomGlobalCredSet: true }));
    }
    dispatch(fetchLiveData(courseId));
  }, [courseId, isZoomBtnClicked]);

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
            {values.provider === 'zoom' ? (
              <>
                <ZoomSettings values={values} />
                {!isZoomGlobalCredSet && (
                  <StatefulButton
                    name="zoom.global.creds.btn"
                    id="zoom.global.creds.btn"
                    // className={"nafath-authenticate-button"}
                    variant="brand"
                    state={
                      // (setIsZoomBtnClicked && "pending") ||
                      // (props.state.success && "complete") ||
                      'default'
                    }
                    labels={{
                      default: intl.formatMessage(
                        messages['zoom.global.creds.btn'],
                      ),
                      pending: '',
                    }}
                    // disabled={registrationBtnClicked}
                    onClick={() => setIsZoomBtnClicked(true)}
                    // onMouseDown={(e) => e.preventDefault()}
                  />
                )}
              </>
            ) : (
              <BBBSettings values={values} setFieldValue={setFieldValue} />
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
