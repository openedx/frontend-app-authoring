import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { StudioFooterSlot } from '@edx/frontend-component-footer';

import Header from '../header';
import messages from './messages';
import AccessibilityBody from './AccessibilityBody';
import AccessibilityForm from './AccessibilityForm';

import { COMMUNITY_ACCESSIBILITY_LINK, ACCESSIBILITY_EMAIL } from './constants';

const AccessibilityPage = () => {
  const intl = useIntl();
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
      <Container size="xl">
        <AccessibilityBody
          {...{ email: ACCESSIBILITY_EMAIL, communityAccessibilityLink: COMMUNITY_ACCESSIBILITY_LINK }}
        />
        <AccessibilityForm accessibilityEmail={ACCESSIBILITY_EMAIL} />
      </Container>
      <StudioFooterSlot />
    </>
  );
};

export default AccessibilityPage;
