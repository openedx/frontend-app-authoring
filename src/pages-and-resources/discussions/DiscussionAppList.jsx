import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Card, CardGrid, Input,
} from '@edx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { history } from '@edx/frontend-platform';
import classNames from 'classnames';

import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import messages from './messages';

import FeaturesTable from './FeaturesTable';
import { useModel, useModels } from '../../generic/model-store';
import { fetchApps } from './data/thunks';

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
          <Card
            key={app.id}
            tabIndex={app.isAvailable ? '-1' : ''}
            onClick={() => { if (app.isAvailable) { handleSelectApp(app.id); } }}
            onKeyPress={() => { if (app.isAvailable) { handleSelectApp(app.id); } }}
            role="radio"
            aria-checked={app.id === selectedAppId}
            style={{
              cursor: 'pointer',
            }}
            className={classNames({
              'border-primary': app.id === selectedAppId,
            })}
          >
            <div
              className="position-absolute"
              style={{
                // This positioning of 0.75rem aligns the checkbox with the top of the logo
                top: '0.75rem',
                right: '0.75rem',
              }}
            >
              {app.isAvailable ? (
                <Input readOnly type="checkbox" checked={app.id === selectedAppId} />
              ) : (
                <FontAwesomeIcon icon={faLock} />
              )}
            </div>
            <Card.Img
              variant="top"
              style={{
                maxHeight: 100,
                objectFit: 'contain',
              }}
              className="py-3 pl-3 pr-5"
              src={app.logo}
              alt={intl.formatMessage(messages.appLogo, {
                name: app.name,
              })}
            />
            <Card.Body>
              <Card.Title>{app.name}</Card.Title>
              <Card.Text>{app.description}</Card.Text>
            </Card.Body>
            <Card.Footer>
              {app.supportLevel}
            </Card.Footer>
          </Card>
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
