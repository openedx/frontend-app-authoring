import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { otherLinkURLParams } from './constants';
import messages from './messages';
import HelpSidebarLink from './HelpSidebarLink';

const HelpSidebar = ({
  intl,
  courseId,
  showOtherSettings,
  proctoredExamSettingsUrl,
  children,
  className,
}) => {
  const { pathname } = useLocation();
  const {
    grading,
    courseTeam,
    advancedSettings,
    scheduleAndDetails,
    groupConfigurations,
  } = otherLinkURLParams;

  const showOtherLink = (params) => !pathname.includes(params);
  const generateLegacyURL = (urlParameter) => {
    const referObj = new URL(`${urlParameter}/${courseId}`, getConfig().STUDIO_BASE_URL);
    return referObj.href;
  };

  const scheduleAndDetailsDestination = generateLegacyURL(scheduleAndDetails);
  const gradingDestination = generateLegacyURL(grading);
  const courseTeamDestination = generateLegacyURL(courseTeam);
  const advancedSettingsDestination = generateLegacyURL(advancedSettings);
  const groupConfigurationsDestination = generateLegacyURL(groupConfigurations);

  return (
    <aside className={classNames('help-sidebar', className)}>
      <div className="help-sidebar-about">{children}</div>
      {showOtherSettings && (
        <>
          <hr />
          <div className="help-sidebar-other">
            <h4 className="help-sidebar-other-title">
              {intl.formatMessage(messages.sidebarTitleOther)}
            </h4>
            <nav
              className="help-sidebar-other-links"
              aria-label={intl.formatMessage(messages.sidebarTitleOther)}
            >
              <ul className="p-0 mb-0">
                {showOtherLink(scheduleAndDetails) && (
                  <HelpSidebarLink
                    pathToPage={scheduleAndDetailsDestination}
                    title={intl.formatMessage(
                      messages.sidebarLinkToScheduleAndDetails,
                    )}
                  />
                )}
                {showOtherLink(grading) && (
                  <HelpSidebarLink
                    pathToPage={gradingDestination}
                    title={intl.formatMessage(messages.sidebarLinkToGrading)}
                  />
                )}
                {showOtherLink(courseTeam) && (
                  <HelpSidebarLink
                    pathToPage={courseTeamDestination}
                    title={intl.formatMessage(messages.sidebarLinkToCourseTeam)}
                  />
                )}
                {showOtherLink(groupConfigurations) && (
                  <HelpSidebarLink
                    pathToPage={groupConfigurationsDestination}
                    title={intl.formatMessage(
                      messages.sidebarLinkToGroupConfigurations,
                    )}
                  />
                )}
                {showOtherLink(advancedSettings) && (
                  <HelpSidebarLink
                    pathToPage={advancedSettingsDestination}
                    title={intl.formatMessage(messages.sidebarLinkToAdvancedSettings)}
                  />
                )}
                {proctoredExamSettingsUrl && (
                  <HelpSidebarLink
                    pathToPage={proctoredExamSettingsUrl}
                    title={intl.formatMessage(
                      messages.sidebarLinkToProctoredExamSettings,
                    )}
                  />
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </aside>
  );
};

HelpSidebar.defaultProps = {
  proctoredExamSettingsUrl: '',
  className: undefined,
  courseId: undefined,
  showOtherSettings: false,
};

HelpSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string,
  showOtherSettings: PropTypes.bool,
  proctoredExamSettingsUrl: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default injectIntl(HelpSidebar);
