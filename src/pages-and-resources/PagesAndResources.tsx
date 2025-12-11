import { useContext, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PageWrap, AppContext } from '@edx/frontend-platform/react';
import { Button, Hyperlink } from '@openedx/paragon';
import { useModels } from '@src/generic/model-store';
import { RequestStatus } from '@src/data/constants';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import getPageHeadTitle from '@src/generic/utils';
import { AdditionalCoursePluginSlot } from '@src/plugin-slots/AdditionalCoursePluginSlot';
import { AdditionalCourseContentPluginSlot } from '@src/plugin-slots/AdditionalCourseContentPluginSlot';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { DeprecatedReduxState } from '@src/store';

import messages from './messages';
import DiscussionsSettings from './discussions';
import PageGrid from './pages/PageGrid';
import { fetchCourseApps } from './data/thunks';
import { getCourseAppsApiStatus, getLoadingStatus } from './data/selectors';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';
import SettingsComponent from './SettingsComponent';

const PagesAndResources = () => {
  const intl = useIntl();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  document.title = getPageHeadTitle(courseDetails?.name || '', intl.formatMessage(messages.heading));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCourseApps(courseId));
  }, [courseId]);

  const courseAppIds = useSelector((state: DeprecatedReduxState) => state.pagesAndResources.courseAppIds);
  const loadingStatus = useSelector(getLoadingStatus);
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);

  // @ts-ignore
  const { config } = useContext(AppContext);
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;
  const redirectUrl = `/course/${courseId}/pages-and-resources`;

  // The pages here are driven by course apps. The list of course app IDs comes from the LMS API.
  // We display all enabled course apps regardless of whether or not the corresponding frontend plugin is available.
  const pages = useModels('courseApps', courseAppIds);

  // We want the Xpert learning assistant and unit summaries to appear in the "Content Permissions" section instead,
  // so we remove them from pages and add them to contentPermissionsPages.
  const contentPermissionsPages: any[] = [];

  ['xpert_unit_summary', 'learning_assistant'].forEach(separateAppId => {
    const index = pages.findIndex(app => app.id === separateAppId);
    if (index !== -1) {
      const [page] = pages.splice(index, 1);
      contentPermissionsPages.push(page);
    }
  });

  if (loadingStatus === RequestStatus.IN_PROGRESS) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  if (courseAppsApiStatus === RequestStatus.DENIED) {
    return (
      <PermissionDeniedAlert />
    );
  }

  const hasAdditionalCoursePlugin = getConfig()?.pluginSlots?.additional_course_plugin != null;

  return (
    <PagesAndResourcesProvider courseId={courseId}>
      <main className="container container-mw-md px-3">
        <div className="d-flex justify-content-between my-4 my-md-5 align-items-center">
          <h3 className="m-0">{intl.formatMessage(messages.heading)}</h3>
          <Hyperlink
            destination={learningCourseURL}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
          >
            <Button variant="outline-primary" className="p-2"> {intl.formatMessage(messages.viewLiveButton)}</Button>
          </Hyperlink>
        </div>

        <Routes>
          <Route path="discussion/configure/:appId" element={<PageWrap><DiscussionsSettings /></PageWrap>} />
          <Route path="discussion" element={<PageWrap><DiscussionsSettings /></PageWrap>} />
          <Route path="discussion/settings" element={<PageWrap><DiscussionsSettings /></PageWrap>} />
          <Route path=":appId/settings" element={<PageWrap><SettingsComponent url={redirectUrl} /></PageWrap>} />
        </Routes>

        <PageGrid pages={pages} pluginSlotComponent={<AdditionalCoursePluginSlot />} courseId={courseId} />
        {
          (contentPermissionsPages.length > 0 || hasAdditionalCoursePlugin)
            && (
              <>
                <div className="d-flex justify-content-between my-4 my-md-5 align-items-center">
                  <h3 className="m-0">{intl.formatMessage(messages.contentPermissions)}</h3>
                </div>
                <PageGrid pages={contentPermissionsPages} pluginSlotComponent={<AdditionalCourseContentPluginSlot />} />
              </>
            )
        }
      </main>
    </PagesAndResourcesProvider>
  );
};

export default PagesAndResources;
