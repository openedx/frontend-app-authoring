import { getConfig } from '@edx/frontend-platform';
import { getPagePath } from '../utils';
import messages from './messages';

export const getContentMenuItems = ({ studioBaseUrl, courseId, intl }) => {
  const items = [
    {
      href: `${studioBaseUrl}/course/${courseId}`,
      title: intl.formatMessage(messages['header.links.outline']),
    },
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
  ];
  if (getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true') {
    items.push({
      href: `${studioBaseUrl}/videos/${courseId}`,
      title: intl.formatMessage(messages['header.links.videoUploads']),
    });
  }

  return items;
};

export const getSettingMenuItems = ({ studioBaseUrl, courseId, intl }) => ([
  {
    href: `${studioBaseUrl}/settings/details/${courseId}`,
    title: intl.formatMessage(messages['header.links.scheduleAndDetails']),
  },
  {
    href: `${studioBaseUrl}/settings/grading/${courseId}`,
    title: intl.formatMessage(messages['header.links.grading']),
  },
  {
    href: `${studioBaseUrl}/course_team/${courseId}`,
    title: intl.formatMessage(messages['header.links.courseTeam']),
  },
  {
    href: `${studioBaseUrl}/group_configurations/${courseId}`,
    title: intl.formatMessage(messages['header.links.groupConfigurations']),
  },
  {
    href: `${studioBaseUrl}/settings/advanced/${courseId}`,
    title: intl.formatMessage(messages['header.links.advancedSettings']),
  },
  {
    href: `${studioBaseUrl}/certificates/${courseId}`,
    title: intl.formatMessage(messages['header.links.certificates']),
  },
]);

export const getToolsMenuItems = ({ studioBaseUrl, courseId, intl }) => ([
  {
    href: `${studioBaseUrl}/import/${courseId}`,
    title: intl.formatMessage(messages['header.links.import']),
  },
  {
    href: `${studioBaseUrl}/import/${courseId}`,
    title: intl.formatMessage(messages['header.links.exportCourse']),
  },
  ...(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true'
    ? [{
      href: `${studioBaseUrl}/api/content_tagging/v1/object_tags/${courseId}/export/`,
      title: intl.formatMessage(messages['header.links.exportTags']),
    }] : []
  ),
  {
    href: `${studioBaseUrl}/checklists/${courseId}`,
    title: intl.formatMessage(messages['header.links.checklists']),
  },
]);
