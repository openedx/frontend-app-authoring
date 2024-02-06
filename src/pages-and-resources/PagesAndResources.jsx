import React, { useContext, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PageWrap, AppContext } from '@edx/frontend-platform/react';

import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { Button, Hyperlink } from '@edx/paragon';
import messages from './messages';
import DiscussionsSettings from './discussions';
import {
  XpertUnitSummarySettings,
  fetchXpertPluginConfigurable,
  fetchXpertSettings,
  appInfo as XpertAppInfo,
} from './xpert-unit-summary';

import PageGrid from './pages/PageGrid';
import { fetchCourseApps } from './data/thunks';
import { useModels, useModel } from '../generic/model-store';
import { getCourseAppsApiStatus, getLoadingStatus } from './data/selectors';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';
import { RequestStatus } from '../data/constants';
import SettingsComponent from './SettingsComponent';
import PermissionDeniedAlert from '../generic/PermissionDeniedAlert';
import getPageHeadTitle from '../generic/utils';
import { useUserPermissions } from '../generic/hooks';

const PagesAndResources = ({ courseId, intl }) => {
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCourseApps(courseId));
    dispatch(fetchXpertPluginConfigurable(courseId));
    dispatch(fetchXpertSettings(courseId));
  }, [courseId]);

  const courseAppIds = useSelector(state => state.pagesAndResources.courseAppIds);
  const loadingStatus = useSelector(getLoadingStatus);
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);

  const { config } = useContext(AppContext);
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;
  const redirectUrl = `/course/${courseId}/pages-and-resources`;

  // Most pages here are driven by a course app. The one exception is the Xpert unit summaries page.
  const pages = useModels('courseApps', courseAppIds);
  const xpertPluginConfigurable = useModel('XpertSettings.enabled', 'xpert-unit-summary');
  const xpertSettings = useModel('XpertSettings', 'xpert-unit-summary');

  // These pages appear in a separate "Content Permissions" section at the bottom of the page.
  // If there are no content permission pages, this section will not appear.
  const contentPermissionsPages = [];

  // Xpert unit summaries
  if (xpertPluginConfigurable?.enabled) {
    contentPermissionsPages.push({
      ...XpertAppInfo,
      enabled: xpertSettings?.enabled !== undefined,
    });
  }

  // Xpert learning assistant
  if (_.some(pages, (page) => page.id === 'learning_assistant')) {
    const index = pages.findIndex(app => app.id === 'learning_assistant');

    // We want the Xpert learning assistant page to appear in the "Content Permissions" section instead,
    // so we remove it from pages and add it to contentPermissionsPages.
    const [page] = pages.splice(index, 1);
    contentPermissionsPages.push(page);
  }

  const { checkPermission } = useUserPermissions();

  const { checkPermission } = useUserPermissions();

  if (loadingStatus === RequestStatus.IN_PROGRESS) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  if (courseAppsApiStatus === RequestStatus.DENIED || !checkPermission('manage_content')) {
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

        <PageGrid pages={pages} />

        {
          !_.isEmpty(contentPermissionsPages) && (
            <>
              <div className="d-flex justify-content-between my-4 my-md-5 align-items-center">
                <h3 className="m-0">{intl.formatMessage(messages.contentPermissions)}</h3>
              </div>
              <PageGrid pages={contentPermissionsPages} />
            </>
          )
        }

        <Routes>
          <Route path="discussion/configure/:appId" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
          <Route path="discussion" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
          <Route path="discussion/settings" element={<PageWrap><DiscussionsSettings courseId={courseId} /></PageWrap>} />
          <Route path="xpert-unit-summary/settings" element={<PageWrap><XpertUnitSummarySettings courseId={courseId} /></PageWrap>} />
          <Route path=":appId/settings" element={<PageWrap><Suspense fallback="..."><SettingsComponent url={redirectUrl} /></Suspense></PageWrap>} />
        </Routes>
      </main>
    </PagesAndResourcesProvider>
  );
};

PagesAndResources.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PagesAndResources);
