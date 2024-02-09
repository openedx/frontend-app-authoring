import { getConfig } from '@edx/frontend-platform';
import { getPagePath } from '../utils';
import messages from './messages';

export const getContentMenuItems = ({
  studioBaseUrl,
  courseId,
  intl,
  hasContentPermissions,
  hasOutlinePermissions,
}) => {
  const items = [];

  if (hasOutlinePermissions) {
    items.push(
      {
        href: `${studioBaseUrl}/course/${courseId}`,
        title: intl.formatMessage(messages['header.links.outline']),
      },
    );
  }
  if (hasContentPermissions) {
    items.push(
      {
        href: `${studioBaseUrl}/course_info/${courseId}`,
        title: intl.formatMessage(messages['header.links.updates']),
      },
      {
        href: getPagePath(courseId, 'true', 'tabs'),
        title: intl.formatMessage(messages['header.links.pages']),
      },
      {
        href: `${studioBaseUrl}/assets/${courseId}`,
        title: intl.formatMessage(messages['header.links.filesAndUploads']),
      },
    );
  }
  if (getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true') {
    items.push({
      href: `${studioBaseUrl}/videos/${courseId}`,
      title: intl.formatMessage(messages['header.links.videoUploads']),
    }
  );
  }

  return items;
};

export const getSettingMenuItems = ({
  studioBaseUrl,
  courseId,
  intl,
  hasAdvancedSettingsAccess,
  hasSettingsPermissions,
}) => {
  const items = [];

  items.push(
    {
      href: `${studioBaseUrl}/settings/details/${courseId}`,
      title: intl.formatMessage(messages['header.links.scheduleAndDetails']),
    },
  );
  if (hasSettingsPermissions) {
    items.push(
      {
        href: `${studioBaseUrl}/settings/grading/${courseId}`,
        title: intl.formatMessage(messages['header.links.grading']),
      },
    );
  }
  items.push(
    {
      href: `${studioBaseUrl}/course_team/${courseId}`,
      title: intl.formatMessage(messages['header.links.courseTeam']),
    },
  );
  if (hasSettingsPermissions) {
    items.push(
      {
        href: `${studioBaseUrl}/group_configurations/course-v1:${courseId}`,
        title: intl.formatMessage(messages['header.links.groupConfigurations']),
      },
    );
  }
  if (hasAdvancedSettingsAccess) {
    items.push(
      {
        href: `${studioBaseUrl}/settings/advanced/${courseId}`,
        title: intl.formatMessage(messages['header.links.advancedSettings']),
      },
    );
  }
  items.push(
    {
      href: `${studioBaseUrl}/certificates/${courseId}`,
      title: intl.formatMessage(messages['header.links.certificates']),
    },
  );
  return items;
};

export const getToolsMenuItems = ({
  studioBaseUrl,
  courseId,
  intl,
  hasToolsPermissions,
}) => {
  const items = [];
  if (hasToolsPermissions) {
    items.push(
      {
        href: `${studioBaseUrl}/import/${courseId}`,
        title: intl.formatMessage(messages['header.links.import']),
      },
      {
        href: `${studioBaseUrl}/export/${courseId}`,
        title: intl.formatMessage(messages['header.links.export']),
      },
      {
        href: `${studioBaseUrl}/checklists/${courseId}`,
        title: intl.formatMessage(messages['header.links.checklists']),
      },
    );
  }
  return items;
};
