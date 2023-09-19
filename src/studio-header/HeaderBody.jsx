import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Nav,
  Row,
} from '@edx/paragon';
import { Close, MenuIcon } from '@edx/paragon/icons';

import messages from './messages';
import CourseLockUp from './CourseLockUp';
import UserMenu from './UserMenu';
import BrandNav from './BrandNav';
import NavDropdownMenu from './NavDropdownMenu';
import { getContentMenuItem, getSettingMenuItems, getToolsMenuItems } from './utils';

const HeaderBody = ({
  logo,
  logoAltText,
  courseId,
  courseNumber,
  courseOrg,
  courseTitle,
  username,
  isAdmin,
  studioBaseUrl,
  logoutUrl,
  authenticatedUserAvatar,
  isMobile,
  setModalPopupTarget,
  toggleModalPopup,
  isModalPopupOpen,
  isHiddenMainMenu,
  // injected
  intl,
}) => {
  const renderBrandNav = (
    <BrandNav
      {...{
        studioBaseUrl,
        logo,
        logoAltText,
      }}
    />
  );

  return (
    <ActionRow as="header" className="site-header-desktop sticky-top px-4 justify-content-start">
      {isHiddenMainMenu ? (
        <Row className="flex-nowrap ml-4">
          {renderBrandNav}
        </Row>
      ) : (
        <>
          {isMobile ? (
            <Button
              ref={setModalPopupTarget}
              className="d-inline-flex align-items-center"
              variant="tertiary"
              onClick={toggleModalPopup}
              iconBefore={isModalPopupOpen ? Close : MenuIcon}
              data-testid="mobile-menu-button"
            >
              Menu
            </Button>
          ) : (
            <Row className="flex-nowrap m-0">
              {renderBrandNav}
              <CourseLockUp
                {...{
                  courseId,
                  courseNumber,
                  courseOrg,
                  courseTitle,
                }}
              />
            </Row>
          )}
          {isMobile ? (
            <>
              <ActionRow.Spacer />
              {renderBrandNav}
            </>
          ) : (
            <Nav data-testid="desktop-menu">
              <NavDropdownMenu
                id={`${intl.formatMessage(messages['header.links.content'])}-dropdown-menu`}
                buttonTitle={intl.formatMessage(messages['header.links.content'])}
                items={getContentMenuItem({ studioBaseUrl, courseId, intl })}
              />
              <NavDropdownMenu
                id={`${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`}
                buttonTitle={intl.formatMessage(messages['header.links.settings'])}
                items={getSettingMenuItems({ studioBaseUrl, courseId, intl })}
              />
              <NavDropdownMenu
                id={`${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`}
                buttonTitle={intl.formatMessage(messages['header.links.tools'])}
                items={getToolsMenuItems({ studioBaseUrl, courseId, intl })}
              />
            </Nav>
          )}
          <ActionRow.Spacer />
          <Nav>
            <UserMenu
              {...{
                username,
                studioBaseUrl,
                logoutUrl,
                authenticatedUserAvatar,
                isAdmin,
              }}
            />
          </Nav>
        </>
      )}
    </ActionRow>
  );
};

HeaderBody.propTypes = {
  studioBaseUrl: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string.isRequired,
  setModalPopupTarget: PropTypes.func.isRequired,
  toggleModalPopup: PropTypes.func.isRequired,
  isModalPopupOpen: PropTypes.bool.isRequired,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string,
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  courseId: PropTypes.string,
  authenticatedUserAvatar: PropTypes.string,
  username: PropTypes.string,
  isAdmin: PropTypes.bool,
  isMobile: PropTypes.bool,
  isHiddenMainMenu: PropTypes.bool,
  // injected
  intl: intlShape.isRequired,
};

HeaderBody.defaultProps = {
  logo: null,
  logoAltText: null,
  courseId: null,
  courseNumber: null,
  courseOrg: null,
  courseTitle: null,
  authenticatedUserAvatar: null,
  username: null,
  isAdmin: false,
  isMobile: false,
  isHiddenMainMenu: false,
};

export default injectIntl(HeaderBody);
