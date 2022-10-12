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

import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import { StudioHeader } from '@edx/frontend-component-header';
import messages from './Header.messages';

import StudioLogoSVG from './assets/studio-logo.svg';

ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
], 'Header component');

function Header({
  courseId, courseNumber, courseOrg, courseTitle, intl,
}) {
  const { authenticatedUser, config } = useContext(AppContext);

  const mainMenu = [
    {
      type: 'submenu',
      content: intl.formatMessage(messages['header.links.content']),
      submenuContent: (
        <>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/course/${courseId}`}>{intl.formatMessage(messages['header.links.outline'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/course_info/${courseId}`}>{intl.formatMessage(messages['header.links.updates'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/tabs/${courseId}`}>{intl.formatMessage(messages['header.links.pages'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/assets/${courseId}`}>{intl.formatMessage(messages['header.links.filesAndUploads'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/textbooks/${courseId}`}>{intl.formatMessage(messages['header.links.textbooks'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/videos/${courseId}`}>{intl.formatMessage(messages['header.links.videoUploads'])}</a>
          </div>
        </>
      ),
    },
    {
      type: 'submenu',
      content: intl.formatMessage(messages['header.links.settings']),
      submenuContent: (
        <>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/settings/details/${courseId}`}>{intl.formatMessage(messages['header.links.scheduleAndDetails'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/settings/grading/${courseId}`}>{intl.formatMessage(messages['header.links.grading'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/course_team/${courseId}`}>{intl.formatMessage(messages['header.links.courseTeam'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/group_configurations/${courseId}`}>{intl.formatMessage(messages['header.links.groupConfigurations'])}</a>
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
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/import/${courseId}`}>{intl.formatMessage(messages['header.links.import'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/export/${courseId}`}>{intl.formatMessage(messages['header.links.export'])}</a>
          </div>
          <div className="mb-1 small">
            <a rel="noopener" href={`${config.STUDIO_BASE_URL}/checklists/${courseId}`}>{intl.formatMessage(messages['header.links.checklists'])}</a>
          </div>
        </>
      ),
    },
  ];

  const courseLockUp = (
    <OverlayTrigger
      placement="bottom"
      overlay={(
        <Tooltip>
          {courseTitle}
        </Tooltip>
      )}
    >
      <a
        className="content-title-block"
        href={`${config.STUDIO_BASE_URL}/course/${courseId}`}
        aria-label={intl.formatMessage(messages['header.label.courseOutline'])}
      >
        <span className="d-block small m-0 w-100 pr-2" data-testid="course-org-number">{courseOrg} {courseNumber}</span>
        <span className="d-block m-0 font-weight-bold w-100 pr-2" data-testid="course-title">{courseTitle}</span>
      </a>
    </OverlayTrigger>
  );

  // const props = {
  //   logo: StudioLogoSVG,
  //   logoAltText: 'Studio edX',
  //   siteName: 'edX',
  //   logoDestination: config.STUDIO_BASE_URL,
  //   courseLockUp,
  //   courseId,
  //   username: authenticatedUser !== null ? authenticatedUser.username : null,
  //   avatar: authenticatedUser !== null ? authenticatedUser.avatar : null,
  //   mainMenu,
  //   userMenu,
  // };

  const actionRowContent = (
    <>
      {courseLockUp}
    </>
  )

  return (
    // <>
    //   <Responsive maxWidth={768}>
    //     <MobileHeader {...props} />
    //   </Responsive>
    //   <Responsive minWidth={769}>
    //     <DesktopHeader {...props} />
    //   </Responsive>
    // </>
    <StudioHeader actionRowContent={actionRowContent}/>
  );
}

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
