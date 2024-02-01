import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import SupportedFeature from './SupportedFeature';
import messages from './messages';

const FeaturesList = ({ app, intl }) => (
  <Collapsible
    onClick={(event) => event.stopPropagation()}
    title={(
      <>
        <Collapsible.Visible whenClosed>
          {intl.formatMessage(messages['supportedFeatureList-mobile-show'])}
        </Collapsible.Visible>
        <Collapsible.Visible whenOpen>
          {intl.formatMessage(messages['supportedFeatureList-mobile-hide'])}
        </Collapsible.Visible>
      </>
    )}
    styling="basic"
  >
    {app.featureIds.map((id) => (
      <div key={`collapsible-${app.id}&${id}`} className="d-flex mb-1">
        <SupportedFeature name={intl.formatMessage(messages[`featureName-${id}`])} />
      </div>
    ))}
  </Collapsible>
);

export default injectIntl(FeaturesList);

FeaturesList.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    featureIds: PropTypes.shape([]).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};
