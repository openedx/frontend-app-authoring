import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useUserPermissions } from '@src/authz/data/apiHooks';
import { COURSE_PERMISSIONS } from '@src/authz/constants';
import { useWaffleFlags } from '../../data/apiHooks';
import { otherLinkURLParams } from './constants';
import messages from './messages';
import HelpSidebarLink from './HelpSidebarLink';

interface HelpSidebarProps {
  courseId: string;
  showOtherSettings?: boolean;
  proctoredExamSettingsUrl?: string;
  children: ReactNode;
  className?: string;
}

const HelpSidebar = ({
  courseId,
  showOtherSettings = false,
  proctoredExamSettingsUrl = '',
  children,
  className,
}: HelpSidebarProps) => {
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
                    pathToPage={`/course/${courseId}/${scheduleAndDetails}`}
                    title={intl.formatMessage(
                      messages.sidebarLinkToScheduleAndDetails,
                    )}
                    isNewPage
                  />
                )}
                {showOtherLink(grading) && (
                  <HelpSidebarLink
                    pathToPage={`/course/${courseId}/${grading}`}
                    title={intl.formatMessage(messages.sidebarLinkToGrading)}
                    isNewPage
                  />
                )}
                {showOtherLink(courseTeam) && (
                  <HelpSidebarLink
                    pathToPage={`/course/${courseId}/${courseTeam}`}
                    title={intl.formatMessage(messages.sidebarLinkToCourseTeam)}
                    isNewPage
                  />
                )}
                {showOtherLink(groupConfigurations) && (
                  <HelpSidebarLink
                    pathToPage={`/course/${courseId}/${groupConfigurations}`}
                    title={intl.formatMessage(
                      messages.sidebarLinkToGroupConfigurations,
                    )}
                    isNewPage
                  />
                )}
                {showOtherLink(advancedSettings) && canManageAdvancedSettings && (
                  <HelpSidebarLink
                    pathToPage={`/course/${courseId}/${advancedSettings}`}
                    title={intl.formatMessage(messages.sidebarLinkToAdvancedSettings)}
                    isNewPage
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

export default HelpSidebar;
