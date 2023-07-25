/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import Responsive from 'react-responsive';
import { AppContext } from '@edx/frontend-platform/react';
import { ensureConfig } from '@edx/frontend-platform';
import { OverlayTrigger, Tooltip } from '@edx/paragon';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import { getPagePath } from '../utils';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import messages from './Header.messages';

ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
  'LOGO_URL',
], 'Header component');

const Header = ({
  courseId, courseNumber, courseOrg, courseTitle, intl,
}) => {
  const { authenticatedUser, config } = useContext(AppContext);

  const mainMenu = [
    {
      type: 'submenu',
      content: intl.formatMessage(messages['header.links.content']),
      submenuContent: (
        <>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_COURSE_OUTLINE_PAGE, 'course')}>{intl.formatMessage(messages['header.links.outline'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_UPDATES_PAGE, 'course_info')}>{intl.formatMessage(messages['header.links.updates'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, 'true', 'tabs')}>{intl.formatMessage(messages['header.links.pages'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_FILES_UPLOADS_PAGE, 'assets')}>{intl.formatMessage(messages['header.links.filesAndUploads'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/textbooks/${courseId}`}>{intl.formatMessage(messages['header.links.textbooks'])}</a>
          </div>
          {process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' && (
            <div className="mb-1 small">
              <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_VIDEO_UPLOAD_PAGE, 'videos')}>{intl.formatMessage(messages['header.links.videoUploads'])}</a>
            </div>
          )}
        </>
      ),
    },
    {
      type: 'submenu',
      content: intl.formatMessage(messages['header.links.settings']),
      submenuContent: (
        <>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_SCHEDULE_DETAILS_PAGE, 'settings/details')}>{intl.formatMessage(messages['header.links.scheduleAndDetails'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_GRADING_PAGE, 'settings/grading')}>{intl.formatMessage(messages['header.links.grading'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_COURSE_TEAM_PAGE, 'course_team')}>{intl.formatMessage(messages['header.links.courseTeam'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/group_configurations/course-v1:${courseId}`}>{intl.formatMessage(messages['header.links.groupConfigurations'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/settings/advanced/${courseId}`}>{intl.formatMessage(messages['header.links.advancedSettings'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/certificates/${courseId}`}>{intl.formatMessage(messages['header.links.certificates'])}</a>
          </div>
        </>
      ),
    },
    {
      type: 'submenu',
      content: intl.formatMessage(messages['header.links.tools']),
      submenuContent: (
        <>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_IMPORT_PAGE, 'import')}>{intl.formatMessage(messages['header.links.import'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={getPagePath(courseId, process.env.ENABLE_NEW_EXPORT_PAGE, 'export')}>{intl.formatMessage(messages['header.links.export'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/checklists/${courseId}`}>{intl.formatMessage(messages['header.links.checklists'])}</a>
          </div>
        </>
      ),
    },
  ];

  const studioHomeItem = {
    type: 'item',
    href: config.STUDIO_BASE_URL,
    content: intl.formatMessage(messages['header.user.menu.studio']),
  };

  const logoutItem = {
    type: 'item',
    href: config.LOGOUT_URL,
    content: intl.formatMessage(messages['header.user.menu.logout']),
  };

  let userMenu = [];

  if (authenticatedUser !== null) {
    if (authenticatedUser.administrator) {
      userMenu = [
        studioHomeItem,
        {
          type: 'item',
          href: `${config.STUDIO_BASE_URL}/maintenance`,
          content: intl.formatMessage(messages['header.user.menu.maintenance']),
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

  const courseLockUp = (
    <OverlayTrigger
      placement="bottom"
      overlay={(
        <Tooltip id="course-lock-up">
          {courseTitle}
        </Tooltip>
      )}
    >
      <a
        className="course-title-lockup w-25"
        href={getPagePath(courseId, process.env.ENABLE_NEW_COURSE_OUTLINE_PAGE, 'course')}
        aria-label={intl.formatMessage(messages['header.label.courseOutline'])}
      >
        <span className="d-block small m-0" data-testid="course-org-number">{courseOrg} {courseNumber}</span>
        <span className="d-block m-0 font-weight-bold" data-testid="course-title">{courseTitle}</span>
      </a>
    </OverlayTrigger>
  );

  const props = {
    logo: config.LOGO_URL,
    logoAltText: 'Studio edX',
    siteName: 'edX',
    logoDestination: process.env.ENABLE_NEW_HOME_PAGE === 'true' ? '/home' : config.STUDIO_BASE_URL,
    courseLockUp,
    courseId,
    username: authenticatedUser !== null ? authenticatedUser.username : null,
    avatar: authenticatedUser !== null ? authenticatedUser.avatar : null,
    mainMenu,
    userMenu,
  };
  return (
    <>
      <Responsive maxWidth={768}>
        <MobileHeader {...props} />
      </Responsive>
      <Responsive minWidth={769}>
        <DesktopHeader {...props} />
      </Responsive>
    </>
  );
};

Header.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

Header.defaultProps = {
  courseNumber: null,
  courseOrg: null,
};

export default injectIntl(Header);
