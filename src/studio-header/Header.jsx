// This file was copied from edx/frontend-component-header-edx.
import React, { useContext, useEffect, useState } from 'react';
import Responsive from 'react-responsive';
import { getLearnerPortalLinks, getSelectedEnterpriseUUID } from '@edx/frontend-enterprise';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import {
  APP_CONFIG_INITIALIZED,
  ensureConfig,
  mergeConfig,
  getConfig,
  subscribe,
} from '@edx/frontend-platform';

import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

import LogoSVG from './logo.svg';

import messages from './Header.messages';

ensureConfig([
  'LMS_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
  'MARKETING_SITE_BASE_URL',
  'ORDER_HISTORY_URL',
], 'Header component');

subscribe(APP_CONFIG_INITIALIZED, () => {
  mergeConfig({
    MINIMAL_HEADER: !!process.env.MINIMAL_HEADER,
  }, 'Header additional config');
});

function Header({ intl }) {
  const { authenticatedUser, config } = useContext(AppContext);
  const [enterpriseLearnerPortalLinks, setEnterpriseLearnerPortalLinks] = useState([]);
  const [enterpriseCustomerBrandingConfig, setEnterpriseCustomerBrandingConfig] = useState(null);
  useEffect(() => {
    const httpClient = getAuthenticatedHttpClient();
    getLearnerPortalLinks(httpClient, authenticatedUser).then((learnerPortalLinks) => {
      const preferredUUID = getSelectedEnterpriseUUID(authenticatedUser);
      const preferredLearnerPortalLink = learnerPortalLinks.find(learnerPortalLink =>
        learnerPortalLink.uuid === preferredUUID);
      if (preferredLearnerPortalLink) {
        setEnterpriseCustomerBrandingConfig({
          logo: preferredLearnerPortalLink.branding_configuration.logo,
          logoAltText: preferredLearnerPortalLink.title,
          logoDestination: preferredLearnerPortalLink.url,
        });
      }

      const links = learnerPortalLinks.map(({ url, title }) => ({
        type: 'item',
        href: url,
        content: `${title} Dashboard`,
      }));
      setEnterpriseLearnerPortalLinks(links);
    });
  }, []);

  const mainMenu = [
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/dashboard`,
      content: intl.formatMessage(messages['header.links.courses']),
    },
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/dashboard/programs`,
      content: intl.formatMessage(messages['header.links.programs']),
    },
    {
      type: 'item',
      href: `${config.MARKETING_SITE_BASE_URL}/course`,
      content: intl.formatMessage(messages['header.links.content.search']),
      onClick: () => {
        sendTrackEvent(
          'edx.bi.dashboard.find_courses_button.clicked',
          { category: 'header', label: 'header' },
        );
      },
    },
  ];

  const dashboardMenuItem = {
    type: 'item',
    href: `${config.LMS_BASE_URL}/dashboard`,
    content: intl.formatMessage(messages['header.user.menu.dashboard']),
  };

  const logoutMenuItem = {
    type: 'item',
    href: config.LOGOUT_URL,
    content: intl.formatMessage(messages['header.user.menu.logout']),
  };

  // If there are Enterprise LP links, use those instead of the B2C Dashboard
  let baseUserMenuDashboardLinks = [];
  if (enterpriseLearnerPortalLinks && enterpriseLearnerPortalLinks.length > 0) {
    baseUserMenuDashboardLinks = [...enterpriseLearnerPortalLinks];
  } else {
    baseUserMenuDashboardLinks = [dashboardMenuItem];
  }

  let userMenu = authenticatedUser === null ? [] : [
    ...baseUserMenuDashboardLinks,
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/u/${authenticatedUser.username}`,
      content: intl.formatMessage(messages['header.user.menu.profile']),
    },
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/account/settings`,
      content: intl.formatMessage(messages['header.user.menu.account.settings']),
    },
    {
      type: 'item',
      href: config.ORDER_HISTORY_URL,
      content: intl.formatMessage(messages['header.user.menu.order.history']),
    },
    logoutMenuItem,
  ];

  if (getConfig().MINIMAL_HEADER && authenticatedUser !== null) {
    userMenu = [
      dashboardMenuItem,
      logoutMenuItem,
    ];
  }

  const loggedOutItems = [
    {
      type: 'item',
      href: config.LOGIN_URL,
      content: intl.formatMessage(messages['header.user.menu.login']),
    },
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/register`,
      content: intl.formatMessage(messages['header.user.menu.register']),
    },
  ];

  let props = {
    logo: LogoSVG,
    logoAltText: 'edX',
    siteName: 'edX',
    logoDestination: getConfig().MINIMAL_HEADER ? null : `${config.LMS_BASE_URL}/dashboard`,
    loggedIn: authenticatedUser !== null,
    username: authenticatedUser !== null ? authenticatedUser.username : null,
    avatar: authenticatedUser !== null ? authenticatedUser.avatar : null,
    mainMenu: getConfig().MINIMAL_HEADER ? [] : mainMenu,
    userMenu,
    loggedOutItems,
  };

  if (enterpriseCustomerBrandingConfig) {
    props = {
      ...props,
      ...enterpriseCustomerBrandingConfig,
    };
  }

  return (
    <React.Fragment>
      <Responsive maxWidth={768}>
        <MobileHeader {...props} />
      </Responsive>
      <Responsive minWidth={769}>
        <DesktopHeader {...props} />
      </Responsive>
    </React.Fragment>
  );
}

Header.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Header);
