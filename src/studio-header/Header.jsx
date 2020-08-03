// This file was copied from edx/frontend-component-header-edx.
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Responsive from 'react-responsive';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { ensureConfig } from '@edx/frontend-platform';

import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

import StudioLogoPNG from './assets/studio-logo.png';

ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
], 'Header component');

function Header({ courseId }) {
  const { authenticatedUser, config } = useContext(AppContext);

  const desktopMainMenu = [];
  const mobileMainMenu = [
    {
      type: 'item',
      href: `${config.STUDIO_BASE_URL}/course/${courseId}`,
      content: 'Back to Studio Course Outline',
    },
  ];

  const studioHomeItem = {
    type: 'item',
    href: config.STUDIO_BASE_URL,
    content: 'Studio Home',
  };

  const logoutItem = {
    type: 'item',
    href: config.LOGOUT_URL,
    content: 'Sign Out',
  };

  let userMenu = [];

  if (authenticatedUser !== null) {
    if (authenticatedUser.administrator) {
      userMenu = [
        studioHomeItem,
        {
          type: 'item',
          href: `${config.STUDIO_BASE_URL}/maintenance`,
          content: 'Maintenance',
        },
        logoutItem,
      ];
    } else {
      userMenu = [
        studioHomeItem,
        logoutItem,
      ];
    }
  }

  const props = {
    logo: StudioLogoPNG,
    logoAltText: 'Studio edX',
    siteName: 'edX',
    logoDestination: config.STUDIO_BASE_URL,
    courseTitleDestination: `${config.STUDIO_BASE_URL}/course/${courseId}`,
    courseId,
    username: authenticatedUser !== null ? authenticatedUser.username : null,
    avatar: authenticatedUser !== null ? authenticatedUser.avatar : null,
    userMenu,
  };

  return (
    <>
      <Responsive maxWidth={768}>
        <MobileHeader {...props} mainMenu={mobileMainMenu} />
      </Responsive>
      <Responsive minWidth={769}>
        <DesktopHeader {...props} mainMenu={desktopMainMenu} />
      </Responsive>
    </>
  );
}

Header.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(Header);
