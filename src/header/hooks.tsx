import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { Badge } from '@openedx/paragon';

import { getPagePath } from '@src/utils';
import { useWaffleFlags } from '@src/data/apiHooks';
import { getStudioHomeData } from '@src/studio-home/data/selectors';
import courseOptimizerMessages from '@src/optimizer-page/messages';
import { SidebarActions } from '@src/library-authoring/common/context/SidebarContext';
import { LibQueryParamKeys } from '@src/library-authoring/routes';

import { useUserPermissions } from '@src/authz/data/apiHooks';
import { COURSE_PERMISSIONS } from '@src/authz/constants';
import messages from './messages';

export const useContentMenuItems = (courseId: string) => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const waffleFlags = useWaffleFlags();
  const { librariesV2Enabled } = useSelector(getStudioHomeData);

  const items = [
    {
      href: waffleFlags.useNewCourseOutlinePage ? `/course/${courseId}` : `${studioBaseUrl}/course/${courseId}`,
      title: intl.formatMessage(messages['header.links.outline']),
    },
    {
      href: waffleFlags.useNewUpdatesPage ? `/course/${courseId}/course_info` : `${studioBaseUrl}/course_info/${courseId}`,
      title: intl.formatMessage(messages['header.links.updates']),
    },
    {
      href: getPagePath(courseId, 'true', 'tabs'),
      title: intl.formatMessage(messages['header.links.pages']),
    },
    {
      href: waffleFlags.useNewFilesUploadsPage ? `/course/${courseId}/assets` : `${studioBaseUrl}/assets/${courseId}`,
      title: intl.formatMessage(messages['header.links.filesAndUploads']),
    },
  ];
  if (getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' || waffleFlags.useNewVideoUploadsPage) {
    items.push({
      href: `/course/${courseId}/videos`,
      title: intl.formatMessage(messages['header.links.videoUploads']),
    });
  }

  if (librariesV2Enabled) {
    items.splice(1, 0, {
      href: `/course/${courseId}/libraries`,
      title: intl.formatMessage(messages['header.links.libraries']),
    });
  }

  return items;
};

export const useSettingMenuItems = (courseId: string) => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const { canAccessAdvancedSettings: legacyCanAccessAdvancedSettings } = useSelector(getStudioHomeData);
  const waffleFlags = useWaffleFlags(courseId);

  /*
    AuthZ for Course Authoring
    If authz.enable_course_authoring flag is enabled, validate permissions using AuthZ API.
    Otherwise, fallback to existing logic.
  */
  const isAuthzEnabled = waffleFlags.enableAuthzCourseAuthoring;
  const { isLoading: isLoadingUserPermissions, data: userPermissions } = useUserPermissions({
    canManageAdvancedSettings: {
      action: COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS,
      scope: courseId,
    },
  }, isAuthzEnabled);

  const authzCanManageAdvancedSettings = isLoadingUserPermissions
    ? false
    : userPermissions?.canManageAdvancedSettings || false;

  const canAccessAdvancedSettings = isAuthzEnabled
    ? authzCanManageAdvancedSettings
    : legacyCanAccessAdvancedSettings;

  const items = [
    {
      href: waffleFlags.useNewScheduleDetailsPage ? `/course/${courseId}/settings/details` : `${studioBaseUrl}/settings/details/${courseId}`,
      title: intl.formatMessage(messages['header.links.scheduleAndDetails']),
    },
    {
      href: waffleFlags.useNewGradingPage ? `/course/${courseId}/settings/grading` : `${studioBaseUrl}/settings/grading/${courseId}`,
      title: intl.formatMessage(messages['header.links.grading']),
    },
    {
      href: waffleFlags.useNewCourseTeamPage ? `/course/${courseId}/course_team` : `${studioBaseUrl}/course_team/${courseId}`,
      title: intl.formatMessage(messages['header.links.courseTeam']),
    },
    {
      href: waffleFlags.useNewGroupConfigurationsPage ? `/course/${courseId}/group_configurations` : `${studioBaseUrl}/group_configurations/${courseId}`,
      title: intl.formatMessage(messages['header.links.groupConfigurations']),
    },
    ...(canAccessAdvancedSettings
      ? [{
        href: waffleFlags.useNewAdvancedSettingsPage ? `/course/${courseId}/settings/advanced` : `${studioBaseUrl}/settings/advanced/${courseId}`,
        title: intl.formatMessage(messages['header.links.advancedSettings']),
      }] : []
    ),
  ];
  if (getConfig().ENABLE_CERTIFICATE_PAGE === 'true' || waffleFlags.useNewCertificatesPage) {
    items.push({
      href: `/course/${courseId}/certificates`,
      title: intl.formatMessage(messages['header.links.certificates']),
    });
  }
  return items;
};

export const useToolsMenuItems = (courseId: string) => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const waffleFlags = useWaffleFlags();

  const items = [
    {
      href: waffleFlags.useNewImportPage ? `/course/${courseId}/import` : `${studioBaseUrl}/import/${courseId}`,
      title: intl.formatMessage(messages['header.links.import']),
    },
    {
      href: waffleFlags.useNewExportPage ? `/course/${courseId}/export` : `${studioBaseUrl}/export/${courseId}`,
      title: intl.formatMessage(messages['header.links.exportCourse']),
    },
    ...(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true'
      ? [{
        href: `${studioBaseUrl}/course/${courseId}#export-tags`,
        title: intl.formatMessage(messages['header.links.exportTags']),
      }] : []
    ),
    {
      href: `/course/${courseId}/checklists`,
      title: intl.formatMessage(messages['header.links.checklists']),
    },
    ...(waffleFlags.enableCourseOptimizer ? [{
      href: `/course/${courseId}/optimizer`,
      title: (
        <>
          {intl.formatMessage(messages['header.links.optimizer'])}
          <Badge variant="primary" className="ml-2">{intl.formatMessage(courseOptimizerMessages.new)}</Badge>
        </>
      ),
    }] : []),
  ];

  return items;
};

export const useLibraryToolsMenuItems = (itemId: string) => {
  const intl = useIntl();

  const items = [
    {
      href: `/library/${itemId}/backup`,
      title: intl.formatMessage(messages['header.links.exportLibrary']),
    },
    {
      href: `/library/${itemId}/import`,
      title: intl.formatMessage(messages['header.links.lib.import']),
    },
  ];

  return items;
};

export const useLibrarySettingsMenuItems = (itemId: string, readOnly: boolean) => {
  const intl = useIntl();

  const openTeamAccessModalUrl = () => {
    const adminConsoleUrl = getConfig().ADMIN_CONSOLE_URL;
    // always show link to admin console MFE if it is being used
    const shouldShowAdminConsoleLink = !!adminConsoleUrl;

    // if the admin console MFE isn't being used, show team modal button for non–read-only users
    const shouldShowTeamModalButton = !adminConsoleUrl && !readOnly;
    if (shouldShowTeamModalButton) {
      if (!window.location.href) {
        return null;
      }
      const url = new URL(window.location.href);
      // Set ?sa=manage-team in url which in turn opens team access modal
      url.searchParams.set(LibQueryParamKeys.SidebarActions, SidebarActions.ManageTeam);
      return url.toString();
    }
    if (shouldShowAdminConsoleLink) {
      return `${adminConsoleUrl}/authz/libraries/${itemId}`;
    }
    return null;
  };

  const items: { title: string; href: string }[] = [];

  const teamAccessUrl = openTeamAccessModalUrl();
  if (teamAccessUrl) {
    items.push({
      title: intl.formatMessage(messages['header.menu.teamAccess']),
      href: teamAccessUrl,
    });
  }

  return items;
};
