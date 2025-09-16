import React from 'react';
import { Layout, Card } from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';

import { HelpSidebar } from '../../generic/help-sidebar';
import messages from './messages';

const VerifyEmailLayout = () => {
  const intl = useIntl();
  const { email, username } = getAuthenticatedUser();

  return (
    <Layout
      lg={[{ span: 9 }, { span: 3 }]}
      md={[{ span: 9 }, { span: 3 }]}
      sm={[{ span: 9 }, { span: 3 }]}
      xs={[{ span: 9 }, { span: 3 }]}
      xl={[{ span: 9 }, { span: 3 }]}
    >
      <Layout.Element>
        <section>
          <h3>{intl.formatMessage(messages.headingTitle, { username })}</h3>
          <Card variant="muted">
            <Card.Section
              title={intl.formatMessage(messages.bannerTitle)}
              className="small"
            >
              {intl.formatMessage(messages.bannerDescription, { email })}
            </Card.Section>
          </Card>
        </section>
      </Layout.Element>
      <Layout.Element>
        <HelpSidebar>
          <h4 className="help-sidebar-about-title">
            {intl.formatMessage(messages.sidebarTitle)}
          </h4>
          <p className="help-sidebar-about-descriptions">
            {intl.formatMessage(messages.sidebarDescription)}
          </p>
        </HelpSidebar>
      </Layout.Element>
    </Layout>
  );
};

export default VerifyEmailLayout;
