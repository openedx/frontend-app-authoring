import React, { useContext, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PageRoute, AppContext } from '@edx/frontend-platform/react';

import { Switch, useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Hyperlink } from '@edx/paragon';
import messages from './messages';
import DiscussionsSettings from './discussions';

import PageGrid from './pages/PageGrid';
import ResourceList from './resources/ResourcesList';

import { fetchCourseApps } from './data/thunks';
import { useModels } from '../generic/model-store';
import { getLoadingStatus } from './data/selectors';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';
import { RequestStatus } from '../data/constants';

function PagesAndResources({ courseId, intl }) {
  const { path, url } = useRouteMatch();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCourseApps(courseId));
  }, [courseId]);

  const courseAppIds = useSelector(state => state.pagesAndResources.courseAppIds);
  const loadingStatus = useSelector(getLoadingStatus);

  const { config } = useContext(AppContext);
  const lmsCourseURL = `${config.LMS_BASE_URL}/courses/${courseId}`;

  // Each page here is driven by a course app
  const pages = useModels('courseApps', courseAppIds);
  if (loadingStatus === RequestStatus.IN_PROGRESS) {
    return <></>;
  }
  return (
    <PagesAndResourcesProvider courseId={courseId}>
      <main className="container container-mw-md">
        <div className="d-flex justify-content-between my-5">
          <h3>{intl.formatMessage(messages.heading)}</h3>
          <Hyperlink
            destination={lmsCourseURL}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
          >
            <Button variant="outline-primary"> {intl.formatMessage(messages.viewLiveButton)}</Button>
          </Hyperlink>
        </div>

        <PageGrid pages={pages} />
        <ResourceList />
        <Switch>
          <PageRoute
            path={[
              `${path}/discussion/configure/:appId`,
              `${path}/discussion`,
            ]}
          >
            <DiscussionsSettings courseId={courseId} />
          </PageRoute>
          <PageRoute path={`${path}/:appId/settings`}>
            {
              ({ match, history }) => {
                const SettingsComponent = React.lazy(async () => {
                  try {
                    // There seems to be a bug in babel-eslint that causes the checker to crash with the following error
                    // if we use a template string here:
                    //     TypeError: Cannot read property 'range' of null with using template strings here.
                    // Ref: https://github.com/babel/babel-eslint/issues/530
                    return await import('./' + match.params.appId + '/Settings.jsx'); // eslint-disable-line
                  } catch (error) {
                    console.trace(error); // eslint-disable-line no-console
                    return null;
                  }
                });
                return (
                  <Suspense fallback="...">
                    <SettingsComponent onClose={() => history.push(url)} />
                  </Suspense>
                );
              }
            }
          </PageRoute>
        </Switch>
      </main>
    </PagesAndResourcesProvider>
  );
}

PagesAndResources.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PagesAndResources);
