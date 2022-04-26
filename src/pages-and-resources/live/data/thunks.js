import { history } from '@edx/frontend-platform';
import { getLiveConfiguration, getLiveProviders, postLiveConfiguration } from './api';
import {
  updateStatus, updateSaveStatus, updateProviders,
  updateAppIds, updateConfiguration,
} from './slice';
import { RequestStatus } from '../../../data/constants';

function normalizeLiveConfig(config) {
  const configuration = {};
  configuration.courseKey = config?.courseKey || '';
  configuration.enabled = config?.enabled || false;
  configuration.consumerKey = config?.ltiConfiguration?.lti1P1ClientKey || '';
  configuration.consumerSecret = config?.ltiConfiguration?.lti1P1ClientSecret || '';
  configuration.launchUrl = config?.ltiConfiguration?.lti1P1LaunchUrl || '';
  configuration.launchEmail = config?.ltiConfiguration?.ltiConfig?.additionalParameters?.customInstructorEmail || '';
  configuration.provider = config?.providerType || 'zoom';
  configuration.piiSharingEnable = config?.piiSharingAllowed || false;
  return configuration;
}

function deNormalizeLiveConfig(config) {
  const configuration = {};
  configuration.course_key = config.courseKey;
  configuration.provider_type = config?.provider || 'zoom';
  configuration.enabled = config?.enabled || false;
  configuration.lti_configuration = {
    lti_1p1_client_key: config?.consumerKey || '',
    lti_1p1_client_secret: config?.consumerSecret || '',
    lti_1p1_launch_url: config?.launchUrl || '',
    version: 'lti_1p1',
    lti_config: {
      additional_parameters: {
        custom_instructor_email: config?.launchEmail || '',
      },
    },
  };
  configuration.pii_sharing_allowed = config?.piiSharingEnable || false;
  return configuration;
}

export function fetchLiveProviders(courseId) {
  return async (dispatch) => {
    const providers = await getLiveProviders(courseId);
    dispatch(updateProviders(providers.providers));
    const availableProvidersInfo = [];
    Object.keys(providers.providers.available).forEach((key) => { availableProvidersInfo.push({ id: key }); });
    dispatch(updateAppIds(availableProvidersInfo));
  };
}

function updateLiveConfigurationState(config) {
  return async (dispatch) => {
    const data = normalizeLiveConfig(config);
    dispatch(updateConfiguration(data));
  };
}

export function fetchLiveConfiguration(courseId) {
  return async (dispatch) => {
    const config = await getLiveConfiguration(courseId);
    dispatch(updateLiveConfigurationState(config));
  };
}

export function fetchLiveData(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      await dispatch(fetchLiveConfiguration(courseId));
      await dispatch(fetchLiveProviders(courseId));
      dispatch(updateStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateStatus({ status: RequestStatus.FAILED }));
      }
    }
  };
}

export function saveLiveConfiguration(courseId, config) {
  return async (dispatch) => {
    dispatch(updateSaveStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const configuration = normalizeLiveConfig(
        (await postLiveConfiguration(courseId, deNormalizeLiveConfig(config))).data,
      );
      dispatch(updateConfiguration(configuration));
      dispatch(updateSaveStatus({ status: RequestStatus.SUCCESSFUL }));
      history.push(`/course/${courseId}/pages-and-resources/`);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateSaveStatus({ status: RequestStatus.DENIED }));
        dispatch(updateStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateSaveStatus({ status: RequestStatus.FAILED }));
      }
    }
  };
}
