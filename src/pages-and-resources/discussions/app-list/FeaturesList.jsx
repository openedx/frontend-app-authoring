import React from 'react';
import PropTypes from 'prop-types';
import { Remove, Check } from '@edx/paragon/icons';
import { Collapsible } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const SupportedFeature = (
  <span className="mr-3">
    <Check id="check-icon" className="text-success-500" />
  </span>
);
const NonSupportedFeature = (
  <span className="mr-3">
    <Remove id="remove-icon" className="text-light-700" />
  </span>
);

function FeaturesList({ app, features, intl }) {
  return (
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
      {features && features.map((feature) => (
        <div key={`collapsible-${app.id}&${feature.id}`}>
          {app.featureIds.includes(feature.id)
            ? SupportedFeature
            : NonSupportedFeature}
          {intl.formatMessage(messages[`featureName-${feature.id}`])}
        </div>
      ))}
    </Collapsible>
  );
}

export default injectIntl(FeaturesList);

FeaturesList.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    featureIds: PropTypes.array.isRequired,
  }).isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: intlShape.isRequired,
};
