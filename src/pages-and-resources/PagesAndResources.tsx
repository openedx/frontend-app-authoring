import { Routes, Route } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PageWrap } from '@edx/frontend-platform/react';
import { Button, Hyperlink } from '@openedx/paragon';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import getPageHeadTitle from '@src/generic/utils';
import { AdditionalCoursePluginSlot } from '@src/plugin-slots/AdditionalCoursePluginSlot';
import { AdditionalCourseContentPluginSlot } from '@src/plugin-slots/AdditionalCourseContentPluginSlot';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { getPagesAndResourcesPermissions } from '@src/authz/permissionHelpers';

import messages from './messages';
import DiscussionsSettings from './discussions';
import PageGrid from './pages/PageGrid';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';
import SettingsComponent from './SettingsComponent';
import { RequestStatus } from '@src/data/constants';

const PagesAndResources = () => {
  const intl = useIntl();
  const {
    courseId,
    courseDetails,
    courseApps,
    courseAppsStatus,
  } = useCourseAuthoringContext();
  document.title = getPageHeadTitle(courseDetails?.name || '', intl.formatMessage(messages.heading));

  const {
    isLoading: isLoadingUserPermissions,
    isAuthzEnabled,
    canViewPagesAndResources,
    canManagePagesAndResources,
  } = useCourseUserPermissions(courseId, getPagesAndResourcesPermissions(courseId));

  const learningCourseURL = `${getConfig().LEARNING_BASE_URL}/course/${courseId}`;
  const redirectUrl = `/course/${courseId}/pages-and-resources`;

  // We want the Xpert learning assistant and unit summaries to appear in the "Content Permissions" section instead,
  // so we remove them from pages and add them to contentPermissionsPages.
  const contentPermissionsPages: any[] = [];

  ['xpert_unit_summary', 'learning_assistant'].forEach(separateAppId => {
    const index = courseApps.findIndex(app => app.id === separateAppId);
    if (index !== -1) {
      const [page] = courseApps.splice(index, 1);
      contentPermissionsPages.push(page);
    }
  });

  if (courseAppsStatus === RequestStatus.PENDING || isLoadingUserPermissions) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  // Gate: if user has neither VIEW nor MANAGE permission, show permission denied
  const hasNoAccess = (!isAuthzEnabled && courseAppsStatus === RequestStatus.DENIED)
    || (isAuthzEnabled && !canViewPagesAndResources && !canManagePagesAndResources);

  if (hasNoAccess) {
    return <PermissionDeniedAlert />;
  }

  // When authz is disabled every authenticated user has full edit access.
  const isEditable = !isAuthzEnabled || !!canManagePagesAndResources;
  const hasAdditionalCoursePlugin = getConfig()?.pluginSlots?.additional_course_plugin != null;

  return (
    <PagesAndResourcesProvider courseId={courseId} isEditable={isEditable}>
      <main className="container container-mw-md px-3">
        <div className="d-flex justify-content-between my-4 my-md-5 align-items-center">
          <h3 className="m-0">{intl.formatMessage(messages.heading)}</h3>
          <Hyperlink
            destination={learningCourseURL}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
          >
            <Button variant="outline-primary" className="p-2">{intl.formatMessage(messages.viewLiveButton)}</Button>
          </Hyperlink>
        </div>
        <Routes>
          <Route
            path="discussion/configure/:appId"
            element={
              <PageWrap>
                <DiscussionsSettings />
              </PageWrap>
            }
          />
          <Route
            path="discussion"
            element={
              <PageWrap>
                <DiscussionsSettings />
              </PageWrap>
            }
          />
          <Route
            path="discussion/settings"
            element={
              <PageWrap>
                <DiscussionsSettings />
              </PageWrap>
            }
          />
          <Route
            path=":appId/settings"
            element={
              <PageWrap>
                <SettingsComponent url={redirectUrl} />
              </PageWrap>
            }
          />
        </Routes>

        <PageGrid
          pages={courseApps}
          pluginSlotComponent={<AdditionalCoursePluginSlot />}
          courseId={courseId}
        />
        {(contentPermissionsPages.length > 0 || hasAdditionalCoursePlugin)
          && (
            <>
              <div className="d-flex justify-content-between my-4 my-md-5 align-items-center">
                <h3 className="m-0">{intl.formatMessage(messages.contentPermissions)}</h3>
              </div>
              <PageGrid
                pages={contentPermissionsPages}
                pluginSlotComponent={<AdditionalCourseContentPluginSlot />}
              />
            </>
          )}
      </main>
    </PagesAndResourcesProvider>
  );
};

export default PagesAndResources;
