import React, { useCallback, useEffect } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CardGrid, Container } from '@edx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import { useModels } from '../../../generic/model-store';
import { selectApp, LOADED, LOADING } from '../data/slice';

import AppCard from './AppCard';
import messages from './messages';
import FeaturesTable from './FeaturesTable';
import AppListNextButton from './AppListNextButton';
import Loading from '../../../generic/Loading';

function AppList({ intl }) {
  const dispatch = useDispatch();

  const {
    appIds, featureIds, status, activeAppId, selectedAppId,
  } = useSelector(state => state.discussions);
  const apps = useModels('apps', appIds);
  const features = useModels('features', featureIds);

  useEffect(() => {
    // If selectedAppId is not set, use activeAppId
    if (!selectedAppId) {
      dispatch(selectApp({ appId: activeAppId }));
    }
  }, [selectedAppId, activeAppId]);

  const handleSelectApp = useCallback((appId) => {
    dispatch(selectApp({ appId }));
  }, [selectedAppId]);

  if (!selectedAppId || status === LOADING) {
    return (
      <Loading />
    );
  }

  if (status === LOADED && apps.length === 0) {
    return (
      <Container className="mt-5">
        <p>{intl.formatMessage(messages.noApps)}</p>
      </Container>
    );
  }

  return (
    <div className="m-5">
      <h3 className="my-sm-5 my-4">
        {intl.formatMessage(messages.heading)}
      </h3>
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

      <h3 className="my-sm-5 my-4">
        {intl.formatMessage(messages.supportedFeatures)}
      </h3>

      <FeaturesTable
        apps={apps}
        features={features}
      />
    </div>
  );
}

AppList.propTypes = {
  intl: intlShape.isRequired,
};

const IntlAppList = injectIntl(AppList);

IntlAppList.NextButton = AppListNextButton;

export default IntlAppList;
