import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink } from '@edx/paragon';

import { getPagePath } from '../../utils';
import messages from './messages';

const HelpSidebar = ({
  intl,
  courseId,
  showOtherSettings,
  proctoredExamSettingsUrl,
  children,
  className,
}) => {
  const { pathname } = useLocation();
  const scheduleAndDetailsDestination = getPagePath(
    courseId,
    process.env.ENABLE_NEW_SCHEDULE_DETAILS_PAGE,
    'settings/details',
  );
  const gradingDestination = getPagePath(
    courseId,
    process.env.ENABLE_NEW_GRADING_PAGE,
    'settings/grading',
  );
  const courseTeamDestination = getPagePath(
    courseId,
    process.env.ENABLE_NEW_COURSE_TEAM_PAGE,
    'course_team',
  );
  const advancedSettingsDestination = getPagePath(
    courseId,
    process.env.ENABLE_NEW_ADVANCED_SETTINGS_PAGE,
    'settings/advanced',
  );
  const groupConfigurationsDestination = new URL(
    `/group_configurations/${courseId}`,
    getConfig().STUDIO_BASE_URL,
  );
  const proctoredExamSettingsDestination = new URL(
    `/course/${courseId}/proctored-exam-settings`,
    getConfig().BASE_URL,
  );

  return (
    <aside className={classNames('help-sidebar', className)}>
      <div className="help-sidebar-about">{children}</div>
      <hr />
      {showOtherSettings && (
        <div className="help-sidebar-other">
          <h4 className="help-sidebar-other-title">
            {intl.formatMessage(messages.sidebarTitleOther)}
          </h4>
          <nav
            className="help-sidebar-other-links"
            aria-label={intl.formatMessage(messages.sidebarTitleOther)}
          >
            <ul className="p-0 mb-0">
              {!scheduleAndDetailsDestination.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink destination={scheduleAndDetailsDestination}>
                    {intl.formatMessage(
                      messages.sidebarLinkToScheduleAndDetails,
                    )}
                  </Hyperlink>
                </li>
              )}
              {!gradingDestination.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink rel="noopener" destination={gradingDestination}>
                    {intl.formatMessage(messages.sidebarLinkToGrading)}
                  </Hyperlink>
                </li>
              )}
              {!courseTeamDestination.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink rel="noopener" destination={courseTeamDestination}>
                    {intl.formatMessage(messages.sidebarLinkToCourseTeam)}
                  </Hyperlink>
                </li>
              )}
              {proctoredExamSettingsUrl
                && !proctoredExamSettingsUrl.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={proctoredExamSettingsUrl}
                  >
                    {intl.formatMessage(
                      messages.sidebarLinkToProctoredExamSettings,
                    )}
                  </Hyperlink>
                </li>
              )}
              {!groupConfigurationsDestination.href.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={groupConfigurationsDestination.href}
                  >
                    {intl.formatMessage(
                      messages.sidebarLinkToGroupConfigurations,
                    )}
                  </Hyperlink>
                </li>
              )}
              {!advancedSettingsDestination.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={advancedSettingsDestination}
                  >
                    {intl.formatMessage(messages.sidebarLinkToAdvancedSettings)}
                  </Hyperlink>
                </li>
              )}
              {!proctoredExamSettingsDestination.href.includes(pathname) && !gradingDestination.includes(pathname) && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={proctoredExamSettingsDestination}
                  >
                    {intl.formatMessage(messages.sidebarLinkToProctoredExamSettings)}
                  </Hyperlink>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </aside>
  );
};

HelpSidebar.defaultProps = {
  proctoredExamSettingsUrl: '',
  className: undefined,
};

HelpSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  showOtherSettings: PropTypes.bool.isRequired,
  proctoredExamSettingsUrl: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default injectIntl(HelpSidebar);
