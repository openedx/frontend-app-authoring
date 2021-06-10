import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, MailtoLink,
} from '@edx/paragon';

import messages from '../lti/messages';

const messageFormatting = (title, instructionType, intl, documentationUrls) => (
  documentationUrls[instructionType]
  && instructionType !== 'email_id' && (
    <div key={instructionType}>
      <FormattedMessage
        {...messages.linkText}
        values={{
          link: (
            <Hyperlink
              destination={documentationUrls[instructionType]}
            >
              <FormattedMessage
                {...messages[instructionType]}
                values={{
                  title,
                }}
              />
            </Hyperlink>
          ),
        }}
      />
    </div>
  )
);

function ExternalDocumentations({
  app, intl, title,
}) {
  const { documentationUrls } = app;
  const appInstructions = Object.keys(documentationUrls);
  return (
    <div className="pt-4">
      <h4>{intl.formatMessage(messages.linkTextHeading)}</h4>
      <div className="small text-muted">
        {appInstructions.map((instructionType) => (
          messageFormatting(title, instructionType, intl, documentationUrls)
        ))}
        <hr />
        {documentationUrls.email_id && (
          <FormattedMessage
            {...messages.contact}
            values={{
              link: (
                <MailtoLink
                  to={documentationUrls.email_id}
                  rel="noopener noreferrer"
                >
                  {documentationUrls.email_id}
                </MailtoLink>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}

ExternalDocumentations.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    documentationUrls: PropTypes.shape({
      learn_more: PropTypes.string,
      configuration_documentation: PropTypes.string,
      documentation: PropTypes.string,
      accessibility_documentation: PropTypes.string,
      email_id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
};

export default injectIntl(ExternalDocumentations);
