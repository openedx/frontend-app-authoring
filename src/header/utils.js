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
  if (process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true') {
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
    href: `${studioBaseUrl}/group_configurations/course-v1:${courseId}`,
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
    href: `${studioBaseUrl}/export/${courseId}`,
    title: intl.formatMessage(messages['header.links.export']),
  }, {
    href: `${studioBaseUrl}/checklists/${courseId}`,
    title: intl.formatMessage(messages['header.links.checklists']),
  },
]);
