import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { history } from '@edx/frontend-platform';
import { useModel } from '../../generic/model-store';
import { fetchAppConfig, saveAppConfig } from './data/thunks';
import DiscussionsConfigForm from './DiscussionsConfigForm';

export default function DiscussionConfig({ courseId }) {
  const { params: { appId } } = useRouteMatch();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAppConfig(courseId, appId));
  }, [courseId]);

  const { activeAppId, activeAppConfigId } = useSelector(state => state.discussions);

  const app = useModel('apps', activeAppId);
  const appConfig = useModel('appConfigs', activeAppConfigId);

  const handleSubmit = useCallback((values) => {
    dispatch(saveAppConfig(courseId, appId, values)).then(() => {
      history.push(`/course/${courseId}/pages-and-resources`);
    });
  }, []);

  if (!appConfig || !app) {
    return null;
  }

  return (
    <DiscussionsConfigForm
      courseId={courseId}
      app={app}
      appConfig={appConfig}
      submitHandler={handleSubmit}
    />
  );
}

DiscussionConfig.propTypes = {
  courseId: PropTypes.string.isRequired,
};
