import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CardGrid, Container } from '@edx/paragon';
import { useSelector } from 'react-redux';

import { useModels } from '../../../generic/model-store';

import AppCard from './AppCard';
import messages from './messages';
import FeaturesTable from './FeaturesTable';

function AppList({
  intl, onSelectApp, selectedAppId,
}) {
  const appIds = useSelector(state => state.discussions.appIds);
  const featureIds = useSelector(state => state.discussions.featureIds);
  const apps = useModels('apps', appIds);
  const features = useModels('features', featureIds);

  if (apps.length === 0) {
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
            onClick={onSelectApp}
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
  intl: intlShape.isRequired,
  onSelectApp: PropTypes.func.isRequired,
  selectedAppId: PropTypes.string,
};

AppList.defaultProps = {
  selectedAppId: null,
};

export default injectIntl(AppList);
