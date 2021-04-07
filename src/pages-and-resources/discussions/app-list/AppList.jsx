import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CardGrid, Container } from '@edx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import { useModels } from '../../../generic/model-store';

import AppCard from './AppCard';
import messages from './messages';
import FeaturesTable from './FeaturesTable';
import AppListNextButton from './AppListNextButton';

import { fetchApps } from './data/thunks';
import { selectApp, LOADED } from './data/slice';

function AppList({ courseId, intl }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchApps(courseId));
  }, [courseId]);

  const {
    appIds, featureIds, status, selectedAppId,
  } = useSelector(state => state.discussions.appList);
  const apps = useModels('apps', appIds);
  const features = useModels('features', featureIds);

  const handleSelectApp = useCallback((appId) => {
    dispatch(selectApp({ appId }));
  }, [selectedAppId]);

  if (status === LOADED && apps.length === 0) {
    return (
      <Container className="mt-5">
        <p>{intl.formatMessage(messages.noApps)}</p>
      </Container>
    );
  }

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
          <AppCard
            key={app.id}
            app={app}
            selected={app.id === selectedAppId}
            onClick={handleSelectApp}
          />
        ))}
      </CardGrid>

      <h2 className="my-3">
        {intl.formatMessage(messages.supportedFeatures)}
      </h2>

      <FeaturesTable
        apps={apps}
        features={features}
      />
    </div>
  );
}

AppList.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

const IntlAppList = injectIntl(AppList);

IntlAppList.NextButton = AppListNextButton;

export default IntlAppList;
