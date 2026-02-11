import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { useUserPermissions } from '@src/authz/data/apiHooks';
import { COURSE_PERMISSIONS } from '@src/authz/constants';
import { useWaffleFlags } from '../../data/apiHooks';
import { otherLinkURLParams } from './constants';
import messages from './messages';
import HelpSidebarLink from './HelpSidebarLink';

const HelpSidebar = ({
  courseId,
  showOtherSettings,
  proctoredExamSettingsUrl,
  children,
  className,
}) => {
  const intl = useIntl();
  const { pathname } = useLocation();
  const {
    grading,
    courseTeam,
    advancedSettings,
    scheduleAndDetails,
    groupConfigurations,
  } = otherLinkURLParams;
  const waffleFlags = useWaffleFlags(courseId);

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

  /*
    AuthZ for Course Authoring
    If authz.enable_course_authoring flag is enabled, validate permissions using AuthZ API.
  */
  const isAuthzEnabled = waffleFlags.enableAuthzCourseAuthoring;
  const { isLoading: isLoadingUserPermissions, data: userPermissions } = useUserPermissions({
    canManageAdvancedSettings: {
      action: COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS,
      scope: courseId,
    },
  }, isAuthzEnabled);

  // If it's still loading, don't show the Advanced Settings link, otherwise, use the permission to decide
  const authzCanManageAdvancedSettings = isLoadingUserPermissions
    ? false
    : !!userPermissions?.canManageAdvancedSettings;

  // When authz is enabled, use permission, otherwise it's always allowed (legacy behavior)
  const canManageAdvancedSettings = isAuthzEnabled ? authzCanManageAdvancedSettings : true;

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
                    pathToPage={waffleFlags.useNewScheduleDetailsPage
                      ? `/course/${courseId}/${scheduleAndDetails}` : scheduleAndDetailsDestination}
                    title={intl.formatMessage(
                      messages.sidebarLinkToScheduleAndDetails,
                    )}
                    isNewPage={waffleFlags.useNewScheduleDetailsPage}
                  />
                )}
                {showOtherLink(grading) && (
                  <HelpSidebarLink
                    pathToPage={waffleFlags.useNewGradingPage
                      ? `/course/${courseId}/${grading}` : gradingDestination}
                    title={intl.formatMessage(messages.sidebarLinkToGrading)}
                    isNewPage={waffleFlags.useNewGradingPage}
                  />
                )}
                {showOtherLink(courseTeam) && (
                  <HelpSidebarLink
                    pathToPage={waffleFlags.useNewCourseTeamPage
                      ? `/course/${courseId}/${courseTeam}` : courseTeamDestination}
                    title={intl.formatMessage(messages.sidebarLinkToCourseTeam)}
                    isNewPage={waffleFlags.useNewCourseTeamPage}
                  />
                )}
                {showOtherLink(groupConfigurations) && (
                  <HelpSidebarLink
                    pathToPage={waffleFlags.useNewGroupConfigurationsPage
                      ? `/course/${courseId}/${groupConfigurations}` : groupConfigurationsDestination}
                    title={intl.formatMessage(
                      messages.sidebarLinkToGroupConfigurations,
                    )}
                    isNewPage={waffleFlags.useNewGroupConfigurationsPage}
                  />
                )}
                {showOtherLink(advancedSettings) && canManageAdvancedSettings && (
                  <HelpSidebarLink
                    pathToPage={waffleFlags.useNewAdvancedSettingsPage
                      ? `/course/${courseId}/${advancedSettings}` : advancedSettingsDestination}
                    title={intl.formatMessage(messages.sidebarLinkToAdvancedSettings)}
                    isNewPage={waffleFlags.useNewAdvancedSettingsPage}
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
  courseId: PropTypes.string,
  showOtherSettings: PropTypes.bool,
  proctoredExamSettingsUrl: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default HelpSidebar;
