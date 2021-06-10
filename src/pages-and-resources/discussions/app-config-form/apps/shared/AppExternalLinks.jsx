import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, MailtoLink,
} from '@edx/paragon';

import messages from '../lti/messages';

function AppExternalLinks({
  externalLinks,
  intl,
  title,
}) {
  const { contactEmail, ...links } = externalLinks;
  const linkTypes = Object.keys(links);
  return (
    <div className="pt-4">
      <h4>{intl.formatMessage(messages.linkTextHeading)}</h4>
      <div className="small text-muted">
        {linkTypes.map((type) => (
          links[type] && (
            <div key={type}>
              <Hyperlink
                destination={externalLinks[type]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.formatMessage(messages[type], { title })}
              </Hyperlink>
            </div>
          )
        ))}
        <hr />
        {contactEmail && (
          <FormattedMessage
            {...messages.contact}
            values={{
              link: (
                <MailtoLink
                  to={contactEmail}
                  rel="noopener noreferrer"
                >
                  {contactEmail}
                </MailtoLink>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}

AppExternalLinks.propTypes = {
  externalLinks: PropTypes.shape({
    learnMore: PropTypes.string,
    configuration: PropTypes.string,
    general: PropTypes.string,
    accessibility: PropTypes.string,
    contactEmail: PropTypes.string,
  }).isRequired,
  title: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(AppExternalLinks);
