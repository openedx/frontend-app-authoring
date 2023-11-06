import React from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ErrorAlert } from '@edx/frontend-lib-content-components';

import messages from './messages';

const SettingsComponent = ({ url }) => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const LazyLoadedComponent = React.useMemo(() => React.lazy(() => {
    return import(`@openedx-plugins/course-app-${appId}/Settings.jsx`).catch((err) => { // eslint-disable-line
      // If we couldn't load this plugin, log the details to the console.
      console.trace(err);
      return {
        default: () => <ErrorAlert isError={true}>{intl.formatMessage(messages.errorShowingConfiguration)}</ErrorAlert>,
      };
    });
  }), [appId]);

  return <LazyLoadedComponent onClose={() => navigate(url)} />;
};

SettingsComponent.propTypes = {
  url: PropTypes.string.isRequired,
};

export default SettingsComponent;
