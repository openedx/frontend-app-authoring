import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink, MailtoLink, Stack } from '@openedx/paragon';

import messages from './messages';

const AccessibilityBody = ({
  communityAccessibilityLink,
  email,
}) => (
  <div className="mt-5">
    <header>
      <h2 className="mb-4 pb-1">
        <FormattedMessage {...messages.a11yBodyPageHeader} />
      </h2>
    </header>
    <Stack gap={2.5}>
      <div className="small">
        <FormattedMessage
          {...messages.a11yBodyIntroGraph}
          values={{
            communityAccessibilityLink: (
              <Hyperlink
                destination={communityAccessibilityLink}
                data-testid="accessibility-page-link"
              >
                Website Accessibility Policy
              </Hyperlink>
            ),
          }}
        />
      </div>
      <div className="small">
        <FormattedMessage {...messages.a11yBodyStepsHeader} />
      </div>
      <ol className="small m-0">
        <li>
          <FormattedMessage
            {...messages.a11yBodyEmailHeading}
            values={{
              emailElement: (
                <MailtoLink
                  to={email}
                  data-testid="email-element"
                >
                  {email}
                </MailtoLink>
              ),
            }}
          />
          <ul>
            <li>
              <FormattedMessage {...messages.a11yBodyNameEmail} />
            </li>
            <li>
              <FormattedMessage {...messages.a11yBodyInstitution} />
            </li>
            <li>
              <FormattedMessage {...messages.a11yBodyBarrier} />
            </li>
            <li>
              <FormattedMessage {...messages.a11yBodyTimeConstraints} />
            </li>
          </ul>
        </li>
        <li>
          <FormattedMessage {...messages.a11yBodyReceipt} />
        </li>
        <li>
          <FormattedMessage {...messages.a11yBodyExtraInfo} />
        </li>
      </ol>
      <div className="small">
        <FormattedMessage
          {...messages.a11yBodyA11yFeedback}
          values={{
            emailElement: (
              <MailtoLink
                to={email}
                data-testid="email-element"
              >
                {email}
              </MailtoLink>
            ),
          }}
        />
      </div>
    </Stack>
  </div>
);

AccessibilityBody.propTypes = {
  communityAccessibilityLink: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default injectIntl(AccessibilityBody);
