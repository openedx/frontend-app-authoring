import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, CardGrid,
} from '@edx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { history } from '@edx/frontend-platform';
import { useLocation } from 'react-router';

import { useModel, useModels } from '../../generic/model-store';

import messages from './messages';
import { fetchApps } from './data/thunks';
import DiscussionAppCard from './DiscussionAppCard';
import FeaturesTable from './FeaturesTable';

function DiscussionAppList({ courseId, intl }) {
  const [selectedAppId, setSelectedAppId] = useState(null);
  const { pathname } = useLocation();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchApps(courseId));
  }, [courseId]);

  const appIds = useSelector(state => state.discussions.appIds);
  const featureIds = useSelector(state => state.discussions.featureIds);
  const apps = useModels('apps', appIds);
  const features = useModels('features', featureIds);

  const selectedApp = useModel('apps', selectedAppId);

  const handleSelectApp = useCallback((appId) => {
    if (selectedAppId === appId) {
      setSelectedAppId(null);
    } else {
      setSelectedAppId(appId);
    }
  }, [selectedAppId]);

  const handleConfigureApp = () => {
    history.push(`${pathname}/configure/${selectedAppId}`);
  };

  return (
    <div className="m-5">
      <h2 className="my-4 text-center">{intl.formatMessage(messages.heading)}</h2>
      <CardGrid
        columnSizes={{
          xs: 12,
          sm: 6,
          lg: 4,
        }}
      >
        {apps.map(app => (
          <DiscussionAppCard
            key={app.id}
            app={app}
            selected={app.id === selectedAppId}
            onClick={handleSelectApp}
          />
        ))}
      </CardGrid>

      <div className="d-flex justify-content-between align-items-center">
        <h2 className="my-3">
          {intl.formatMessage(messages.supportedFeatures)}
        </h2>
        {selectedAppId && (
          <Button variant="primary" onClick={handleConfigureApp}>
            {intl.formatMessage(messages.configureApp, { name: selectedApp.name })}
          </Button>
        )}
      </div>

      <FeaturesTable
        apps={apps}
        features={features}
      />
    </div>
  );
}

DiscussionAppList.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionAppList);
