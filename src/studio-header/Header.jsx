/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import Responsive from 'react-responsive';
import { AppContext } from '@edx/frontend-platform/react';
import { ensureConfig } from '@edx/frontend-platform';

import MobileHeader from './MobileHeader';
import HeaderBody from './HeaderBody';

ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
  'LOGO_URL',
], 'Header component');

const Header = ({
  courseId, courseNumber, courseOrg, courseTitle,
}) => {
  const { authenticatedUser, config } = useContext(AppContext);

  const props = {
    logo: config.LOGO_URL,
    logoAltText: `Studio ${config.SITE_NAME}`,
    courseId,
    courseNumber,
    courseOrg,
    courseTitle,
    username: authenticatedUser?.username,
    isAdmin: authenticatedUser?.administrator,
    authenticatedUserAvatar: authenticatedUser?.avatar,
    studioBaseUrl: config.STUDIO_BASE_URL,
    logoutUrl: config.LOGOUT_URL,
  };

  return (
    <>
      <Responsive maxWidth={768}>
        <MobileHeader {...props} />
      </Responsive>
      <Responsive minWidth={769}>
        <HeaderBody {...props} />
      </Responsive>
    </>
  );
};

Header.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string.isRequired,
};

Header.defaultProps = {
  courseNumber: null,
  courseOrg: null,
};

export default Header;
