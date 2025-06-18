import React, { useContext, Suspense } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PageWrap, AppContext } from '@edx/frontend-platform/react';

import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Button, Container, Hyperlink } from '@openedx/paragon';
import messages from './messages';
import DiscussionsSettings from './discussions';

import PageGrid from './pages/PageGrid';
import { useModels, useModel } from '../generic/model-store';
import { getCourseAppsApiStatus, getLoadingStatus } from './data/selectors';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';
import { RequestStatus } from '../data/constants';
import SettingsComponent from './SettingsComponent';
import PermissionDeniedAlert from '../generic/PermissionDeniedAlert';
import getPageHeadTitle from '../generic/utils';

const PagesAndResourcesNew = ({ courseId, intl }) => {
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));

  // const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(fetchCourseApps(courseId));
  //   console.log(courseId, "IDDDD");
  // }, [courseId]);

  const courseAppIds = useSelector(state => state.pagesAndResources.courseAppIds);
  const loadingStatus = useSelector(getLoadingStatus);
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);

  const { config } = useContext(AppContext);
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;
  const redirectUrl = `/course/${courseId}/pages-and-resources`;

  // The pages here are driven by course apps. The list of course app IDs comes from the LMS API.
  // We display all enabled course apps regardless of whether or not the corresponding frontend plugin is available.
  const pages = useModels('courseApps', courseAppIds);

  // We want the Xpert learning assistant and unit summaries to appear in the "Content Permissions" section instead,
  // so we remove them from pages and add them to contentPermissionsPages.
  const contentPermissionsPages = [];

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
      <Container size="xl" className="px-4">
        <main className="container resources mb-4">
          <div className="d-flex justify-content-between my-4 align-items-center">
            <h2 className="m-0">{intl.formatMessage(messages.heading)}</h2>
            <Hyperlink
              destination={learningCourseURL}
              target="_blank"
              rel="noopener noreferrer"
              showLaunchIcon={false}
              className="view_live_button"
            >
              <Button className="p-2"> {intl.formatMessage(messages.viewLiveButton)}</Button>
            </Hyperlink>
          </div>

          <span className="pages_bar" />

          <Routes>
            <Route path="discussion/configure/:appId" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
            <Route path="discussion" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
            <Route path="discussion/settings" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
            <Route path=":appId/settings" element={<PageWrap><Suspense fallback="..."><SettingsComponent url={redirectUrl} /></Suspense></PageWrap>} />
          </Routes>

          <PageGrid pages={pages} pluginSlotId="additional_course_plugin" />
          {
          (contentPermissionsPages.length > 0 || hasAdditionalCoursePlugin)
            && (
              <>
                <div className="d-flex justify-content-between my-4 my-md-5 align-items-center">
                  <h3 className="m-0">{intl.formatMessage(messages.contentPermissions)}</h3>
                </div>
                <PageGrid pages={contentPermissionsPages} pluginSlotId="additional_course_content_plugin" />
              </>
            )
        }
        </main>
      </Container>
    </PagesAndResourcesProvider>
  );
};

PagesAndResourcesNew.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PagesAndResourcesNew);
