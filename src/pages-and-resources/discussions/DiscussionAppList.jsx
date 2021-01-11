import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Container, Row } from '@edx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import messages from './messages';
import DiscussionAppCard from './DiscussionAppCard';
import FeaturesTable from './FeaturesTable';
import { useModels } from '../../generic/model-store';
import { fetchApps } from './data/thunks';

function DiscussionAppList({ courseId, intl }) {
  const [selectedAppId, setSelectedAppId] = useState(null);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchApps(courseId));
  }, [courseId]);

  const appIds = useSelector(state => state.discussions.appIds);
  const featureIds = useSelector(state => state.discussions.featureIds);
  const apps = useModels('apps', appIds);
  const features = useModels('features', featureIds);

  const handleSelectApp = useCallback((appId) => {
    if (selectedAppId === appId) {
      setSelectedAppId(null);
    } else {
      setSelectedAppId(appId);
    }
  }, [selectedAppId]);

  return (
    <Container fluid className="text-info-500">
      <h6 className="my-4 text-center">{intl.formatMessage(messages.heading)}</h6>

      <Row>
        {apps.map(app => (
          <DiscussionAppCard
            key={app.id}
            app={app}
            selected={app.id === selectedAppId}
            clickHandler={handleSelectApp}
          />
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center">
        <h2 className="my-3">
          {intl.formatMessage(messages.supportedFeatures)}
        </h2>
        {selectedAppId && (
          <Button variant="primary">
            {intl.formatMessage(messages.configureTool, { toolName: selectedAppId })}
          </Button>
        )}
      </div>

      <FeaturesTable
        apps={apps}
        features={features}
      />
    </Container>
  );
}

DiscussionAppList.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionAppList);
