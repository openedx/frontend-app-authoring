import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { StudioHeader } from '@edx/frontend-component-header';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';
import { useUserPermissions } from '../generic/hooks';
import { getUserPermissions, getUserPermissionsEnabled } from '../generic/data/selectors';
import { fetchUserPermissionsQuery, fetchUserPermissionsEnabledFlag } from '../generic/data/thunks';
import messages from './messages';

const Header = ({
  courseId,
  courseOrg,
  courseNumber,
  courseTitle,
  isHiddenMainMenu,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const { checkPermission } = useUserPermissions();
  const userPermissions = useSelector(getUserPermissions);
  const userPermissionsEnabled = useSelector(getUserPermissionsEnabled);
  const hasContentPermissions = !userPermissionsEnabled || (userPermissionsEnabled && checkPermission('manage_content'));
  const hasOutlinePermissions = !userPermissionsEnabled || (userPermissionsEnabled && (checkPermission('manage_content') || checkPermission('manage_libraries')));
  const hasAdvancedSettingsAccess = !userPermissionsEnabled
    || (userPermissionsEnabled && (checkPermission('manage_advanced_settings') || checkPermission('view_course_settings')));
  const hasSettingsPermissions = !userPermissionsEnabled
  || (userPermissionsEnabled && (checkPermission('manage_course_settings') || checkPermission('view_course_settings')));
    const hasToolsPermissions = !userPermissionsEnabled
    || (userPermissionsEnabled && (checkPermission('manage_course_settings') || checkPermission('view_course_settings')));
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const contentMenu = getContentMenuItems({
    studioBaseUrl,
    courseId,
    intl,
    hasContentPermissions,
    hasOutlinePermissions,
  });
  const mainMenuDropdowns = [];
  const toolsMenu = getToolsMenuItems({
    studioBaseUrl,
    courseId,
    intl,
    hasToolsPermissions,
  });

  useEffect(() => {
    dispatch(fetchUserPermissionsEnabledFlag());
    if (!userPermissions) {
      dispatch(fetchUserPermissionsQuery(courseId));
    }
  }, [courseId]);

  if (contentMenu.length > 0) {
    mainMenuDropdowns.push(
      {
        id: `${intl.formatMessage(messages['header.links.content'])}-dropdown-menu`,
        buttonTitle: intl.formatMessage(messages['header.links.content']),
        items: contentMenu,
      },
    );
  }
  mainMenuDropdowns.push(
    {
      id: `${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.settings']),
      items: getSettingMenuItems({
        studioBaseUrl,
        courseId,
        intl,
        hasSettingsPermissions,
        hasAdvancedSettingsAccess,
      }),
    },
  );
  if (toolsMenu.length > 0) {
    mainMenuDropdowns.push(
      {
        id: `${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`,
        buttonTitle: intl.formatMessage(messages['header.links.tools']),
        items: toolsMenu,
      },
    );
  }

  const outlineLink = `${studioBaseUrl}/course/${courseId}`;
  return (
    <StudioHeader
      {...{
        org: courseOrg,
        number: courseNumber,
        title: courseTitle,
        isHiddenMainMenu,
        mainMenuDropdowns,
        outlineLink,
      }}
    />
  );
};

Header.propTypes = {
  courseId: PropTypes.string,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string,
  isHiddenMainMenu: PropTypes.bool,
  // injected
  intl: intlShape.isRequired,
};

Header.defaultProps = {
  courseId: '',
  courseNumber: '',
  courseOrg: '',
  courseTitle: '',
  isHiddenMainMenu: false,
};

export default injectIntl(Header);
