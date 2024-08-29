import React from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import ErrorAlert from '../editors/sharedComponents/ErrorAlerts/ErrorAlert';
import messages from './messages';

const PluginLoadFailedError = () => {
  const intl = useIntl();
  return <ErrorAlert isError>{intl.formatMessage(messages.errorShowingConfiguration)}</ErrorAlert>;
};

const SettingsComponent = ({ url }) => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const LazyLoadedComponent = React.useMemo(
    () => React.lazy(() =>
      import(`@openedx-plugins/course-app-${appId}/Settings.jsx`).catch((err) => { // eslint-disable-line
        // If we couldn't load this plugin, log the details to the console.
        console.trace(err); // eslint-disable-line no-console
        return { default: PluginLoadFailedError };
      })),
    [appId],
  );

  return <LazyLoadedComponent onClose={() => navigate(url)} />;
};

SettingsComponent.propTypes = {
  url: PropTypes.string.isRequired,
};

export default SettingsComponent;
