import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { useRouteMatch } from 'react-router';
import { useModel } from '../../generic/model-store';

import LtiConfigForm from './LtiConfigForm';
import { fetchAppConfig } from './data/thunks';

// eslint-disable-next-line no-unused-vars
export default function ConfigFormContainer({
  courseId, onSubmit, formRef,
}) {
  const { params: { appId: routeAppId } } = useRouteMatch();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAppConfig(courseId, routeAppId));
  }, [courseId]);

  const { activeAppId, activeAppConfigId } = useSelector(state => state.discussions);

  const app = useModel('apps', activeAppId);
  const appConfig = useModel('appConfigs', activeAppConfigId);

  if (!appConfig || !app) {
    return null;
  }

  return (
    <LtiConfigForm
      formRef={formRef}
      app={app}
      appConfig={appConfig}
      onSubmit={onSubmit}
    />
  );
}

ConfigFormContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
};
