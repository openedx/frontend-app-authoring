import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PageRoute } from '@edx/frontend-platform/react';

import { Switch, useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import messages from './messages';
import DiscussionsSettings from './discussions';

import PageGrid from './pages/PageGrid';
import ResourceList from './resources/ResourcesList';

import { fetchPages } from './data/thunks';
import { useModels } from '../generic/model-store';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';

function PagesAndResources({ courseId, intl }) {
  const { path } = useRouteMatch();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPages(courseId));
  }, [courseId]);

  const pageIds = useSelector(state => state.pagesAndResources.pageIds);
  const pages = useModels('pages', pageIds);

  return (
    <PagesAndResourcesProvider courseId={courseId}>
      <main>
        <div className="container-fluid pb-3">
          <div className="d-flex justify-content-between align-items-center border-bottom">
            <h1 className="mt-3">{intl.formatMessage(messages.heading)}</h1>
          </div>
          <PageGrid pages={pages} />
          <ResourceList />
        </div>
        <Switch>
          <PageRoute
            path={[
              `${path}/discussions/configure/:appId`,
              `${path}/discussions`,
            ]}
          >
            <DiscussionsSettings courseId={courseId} />
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
