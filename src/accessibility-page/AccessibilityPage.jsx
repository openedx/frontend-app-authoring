import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { StudioFooter } from '@edx/frontend-component-footer';

import Header from '../header';
import messages from './messages';
import AccessibilityBody from './AccessibilityBody';
import AccessibilityForm from './AccessibilityForm';

const AccessibilityPage = ({
  // injected
  intl,
}) => {
  const communityAccessibilityLink = 'https://www.edx.org/accessibility';
  const email = 'accessibility@edx.org';
  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            siteName: process.env.SITE_NAME,
          })}
        </title>
      </Helmet>
      <Header isHiddenMainMenu />
      <Container size="xl" classNamae="px-4">
        <AccessibilityBody {...{ email, communityAccessibilityLink }} />
        <AccessibilityForm accessibilityEmail={email} />
      </Container>
      <StudioFooter />
    </>
  );
};

AccessibilityPage.propTypes = {
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(AccessibilityPage);
