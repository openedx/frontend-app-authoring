import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getPagePath } from '../utils';
import { getStudioHomeData } from '../studio-home/data/selectors';
import messages from './messages';

export const useContentMenuItems = courseId => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;

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

export const useSettingMenuItems = courseId => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const { canAccessAdvancedSettings } = useSelector(getStudioHomeData);

  const items = [
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
    ...(canAccessAdvancedSettings === true
      ? [{
        href: `${studioBaseUrl}/settings/advanced/${courseId}`,
        title: intl.formatMessage(messages['header.links.advancedSettings']),
      }] : []
    ),
  ];
  if (getConfig().ENABLE_CERTIFICATE_PAGE === 'true') {
    items.push({
      href: `${studioBaseUrl}/certificates/${courseId}`,
      title: intl.formatMessage(messages['header.links.certificates']),
    });
  }
  return items;
};

export const useToolsMenuItems = courseId => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;

  const items = [
    {
      href: `${studioBaseUrl}/import/${courseId}`,
      title: intl.formatMessage(messages['header.links.import']),
    },
    {
      href: `${studioBaseUrl}/export/${courseId}`,
      title: intl.formatMessage(messages['header.links.exportCourse']),
    },
    ...(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true'
      ? [{
        href: `${studioBaseUrl}/course/${courseId}#export-tags`,
        title: intl.formatMessage(messages['header.links.exportTags']),
      }] : []
    ),
    {
      href: `${studioBaseUrl}/checklists/${courseId}`,
      title: intl.formatMessage(messages['header.links.checklists']),
    },
  ];
  return items;
};
