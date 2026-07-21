import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCourseUserPermissions } from '@src/authz/hooks';
import { getAdvancedSettingsPermissions } from '@src/authz/permissionHelpers';
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
  const showOtherLink = (params) => !pathname.includes(params);

  /*
    AuthZ for Course Authoring
  */
  const { canManageAdvancedSettings } = useCourseUserPermissions(
    courseId,
    getAdvancedSettingsPermissions(courseId),
  );

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
