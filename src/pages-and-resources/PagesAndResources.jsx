import React, { useContext, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PageWrap, AppContext } from '@edx/frontend-platform/react';

import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Hyperlink } from '@edx/paragon';
import messages from './messages';
import DiscussionsSettings from './discussions';

import PageGrid from './pages/PageGrid';
import { fetchCourseApps } from './data/thunks';
import { useModels, useModel } from '../generic/model-store';
import { getCourseAppsApiStatus, getLoadingStatus } from './data/selectors';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';
import { RequestStatus } from '../data/constants';
import SettingsComponent from './SettingsComponent';
import PermissionDeniedAlert from '../generic/PermissionDeniedAlert';
import getPageHeadTitle from '../generic/utils';

const PagesAndResources = ({ courseId, intl }) => {
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCourseApps(courseId));
  }, [courseId]);

  const courseAppIds = useSelector(state => state.pagesAndResources.courseAppIds);
  const loadingStatus = useSelector(getLoadingStatus);
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);

  const { config } = useContext(AppContext);
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;
  const redirectUrl = `/course/${courseId}/pages-and-resources`;

  // Each page here is driven by a course app
  const pages = useModels('courseApps', courseAppIds);

  if (loadingStatus === RequestStatus.IN_PROGRESS) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  if (courseAppsApiStatus === RequestStatus.DENIED) {
    return (
      <PermissionDeniedAlert />
    );
  }

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
          <Route path="discussion/configure/:appId" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
          <Route path="discussion" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
          <Route path="discussion/settings" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
          <Route path=":appId/settings" element={<PageWrap><Suspense fallback="..."><SettingsComponent url={redirectUrl} /></Suspense></PageWrap>} />
        </Routes>

        <PageGrid pages={pages} />
      </main>
    </PagesAndResourcesProvider>
  );
};

PagesAndResources.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PagesAndResources);
