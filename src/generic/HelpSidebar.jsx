import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';

import { getPagePath } from '../utils';
import messages from './messages';

const HelpSidebar = ({
  intl,
  courseId,
  showOtherSettings,
  proctoredExamSettingsUrl,
  children,
  className,
}) => {
  const { config } = useContext(AppContext);
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
  const groupConfigurationsDestination = `${config.STUDIO_BASE_URL}/group_configurations/${courseId}`;

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
              {pathname !== scheduleAndDetailsDestination && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={scheduleAndDetailsDestination}
                  >
                    {intl.formatMessage(
                      messages.sidebarLinkToScheduleAndDetails,
                    )}
                  </Hyperlink>
                </li>
              )}
              {pathname !== gradingDestination && (
                <li className="help-sidebar-other-link">
                  <Hyperlink rel="noopener" destination={gradingDestination}>
                    {intl.formatMessage(messages.sidebarLinkToGrading)}
                  </Hyperlink>
                </li>
              )}
              {pathname !== courseTeamDestination && (
                <li className="help-sidebar-other-link">
                  <Hyperlink rel="noopener" destination={courseTeamDestination}>
                    {intl.formatMessage(messages.sidebarLinkToCourseTeam)}
                  </Hyperlink>
                </li>
              )}
              {proctoredExamSettingsUrl
                && pathname !== proctoredExamSettingsUrl && (
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
              {pathname !== groupConfigurationsDestination && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={groupConfigurationsDestination}
                  >
                    {intl.formatMessage(
                      messages.sidebarLinkToGroupConfigurations,
                    )}
                  </Hyperlink>
                </li>
              )}
              {pathname !== advancedSettingsDestination && (
                <li className="help-sidebar-other-link">
                  <Hyperlink
                    rel="noopener"
                    destination={advancedSettingsDestination}
                  >
                    {intl.formatMessage(messages.sidebarLinkToAdvancedSettings)}
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
