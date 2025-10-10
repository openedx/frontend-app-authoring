import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, MailtoLink } from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { HelpSidebar } from '../../generic/help-sidebar';
import messages from './messages';

const CourseTeamSideBar = ({ courseId, isOwnershipHint, isShowInitialSidebar }) => {
  const intl = useIntl();
  const courseTeamSupportEmail = process.env.COURSE_TEAM_SUPPORT_EMAIL;

  return (
    <div
      className="course-team-sidebar"
      data-testid={isShowInitialSidebar ? 'course-team-sidebar__initial' : 'course-team-sidebar'}
    >
      <HelpSidebar
        intl={intl}
        courseId={courseId}
        showOtherSettings={false}
      >
        <h4 className="help-sidebar-about-title">
          {intl.formatMessage(messages.sidebarTitle)}
        </h4>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.sidebarAbout_1)}
        </p>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.sidebarAbout_2)}
        </p>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.sidebarAbout_3)}
        </p>
        {courseTeamSupportEmail && (
          <>
            <p className="help-sidebar-other-title">
              <sub>
                <Icon
                  src={InfoOutline}
                  className="d-inline-block mr-2"
                  style={{ height: 21, width: 21 }}
                />
              </sub>
              {intl.formatMessage(messages.helpInfoSidebarTitle)}
            </p>
            <p className="help-sidebar-about-descriptions">
              {intl.formatMessage(messages.helpInfoDescription, {
                email_address: (
                  <MailtoLink to={courseTeamSupportEmail}>
                    {courseTeamSupportEmail}
                  </MailtoLink>
                ),
              })}
            </p>
          </>
        )}
      </HelpSidebar>
      {isOwnershipHint && (
        <>
          <hr />
          <HelpSidebar
            intl={intl}
            courseId={courseId}
            showOtherSettings={false}
          >
            <h4 className="help-sidebar-about-title">
              {intl.formatMessage(messages.ownershipTitle)}
            </h4>
            <p className="help-sidebar-about-descriptions">
              {intl.formatMessage(
                messages.ownershipDescription,
                { strong: <strong>{intl.formatMessage(messages.addAdminAccess)}</strong> },
              )}
            </p>
          </HelpSidebar>
        </>
      )}
    </div>
  );
};

CourseTeamSideBar.defaultProps = {
  isShowInitialSidebar: false,
};

CourseTeamSideBar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isOwnershipHint: PropTypes.bool.isRequired,
  isShowInitialSidebar: PropTypes.bool,
};

export default CourseTeamSideBar;
