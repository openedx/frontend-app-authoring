import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, MailtoLink,
} from '@openedx/paragon';

import AppConfigFormDivider from './AppConfigFormDivider';

import messages from '../lti/messages';

const AppExternalLinks = ({
  externalLinks,
  intl,
  providerName,
  showLaunchIcon,
  customClasses,
}) => {
  const { contactEmail, ...links } = externalLinks;
  const linkTypes = Object.keys(links).filter(key => links[key]);
  return (
    <div className="pt-4">
      {linkTypes.length
        ? (
          <>
            <AppConfigFormDivider />
            <h4 className="pt-4">{intl.formatMessage(messages.linkTextHeading)}</h4>
            {linkTypes.map((type) => (
              <div key={type}>
                <Hyperlink
                  destination={externalLinks[type]}
                  target="_blank"
                  rel="noopener noreferrer"
                  showLaunchIcon={showLaunchIcon}
                  className={customClasses}
                >
                  { intl.formatMessage(messages[type], { providerName }) }
                </Hyperlink>
              </div>
            ))}
          </>
        ) : null}
      {contactEmail && (
        <div className={customClasses}>
          <hr />
          <FormattedMessage
            {...messages.contact}
            values={{
              link: (
                <MailtoLink
                  to={contactEmail}
                  rel="noopener noreferrer"
                >
                  <span className={customClasses}>{ contactEmail }</span>
                </MailtoLink>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
};

AppExternalLinks.propTypes = {
  externalLinks: PropTypes.shape({
    learnMore: PropTypes.string,
    configuration: PropTypes.string,
    general: PropTypes.string,
    accessibility: PropTypes.string,
    contactEmail: PropTypes.string,
  }).isRequired,
  providerName: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  showLaunchIcon: PropTypes.bool,
  customClasses: PropTypes.string,
};

AppExternalLinks.defaultProps = {
  showLaunchIcon: false,
  customClasses: '',
};

export default injectIntl(AppExternalLinks);
