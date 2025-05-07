import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { StudioFooterSlot } from '@edx/frontend-component-footer';

import Header from '../header';
import messages from './messages';
import AccessibilityBody from './AccessibilityBody';
import AccessibilityForm from './AccessibilityForm';

import { COMMUNITY_ACCESSIBILITY_LINK, ACCESSIBILITY_EMAIL } from './constants';

const AccessibilityPage = ({
  // injected
  intl,
}) => (
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
      <AccessibilityBody {...{ ACCESSIBILITY_EMAIL, COMMUNITY_ACCESSIBILITY_LINK }} />
      <AccessibilityForm accessibilityEmail={ACCESSIBILITY_EMAIL} />
    </Container>
    <StudioFooterSlot />
  </>
);

AccessibilityPage.propTypes = {
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(AccessibilityPage);
