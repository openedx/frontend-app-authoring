import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Remove } from '@edx/paragon/icons';
import { Collapsible } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const SupportedFeature = (
  <span className="mr-3">
    <FontAwesomeIcon icon={faCheck} color="green" />
  </span>
);
const NonSupportedFeature = (
  <span className="mr-3"> <Remove /></span>
);

function FeaturesList({ app, features, intl }) {
  return (
    <Collapsible
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
          {feature.id}
        </div>
      ))}
    </Collapsible>
  );
}

export default injectIntl(FeaturesList);

FeaturesList.propTypes = {
  app: PropTypes.arrayOf(PropTypes.object).isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: intlShape.isRequired,
};
