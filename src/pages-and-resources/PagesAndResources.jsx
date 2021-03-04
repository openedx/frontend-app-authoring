import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { useDispatch, useSelector } from 'react-redux';

import messages from './messages';
import PageGrid from './pages/PageGrid';
import ResourceList from './resources/ResourcesList';

import { fetchPages } from './data/thunks';
import { useModels } from '../generic/model-store';

function PagesAndResources({ courseId, intl }) {
  const { config } = useContext(AppContext);
  const lmsCourseURL = `${config.LMS_BASE_URL}/courses/${courseId}`;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPages(courseId));
  }, [courseId]);

  const pageIds = useSelector(state => state.pagesAndResources.pageIds);
  const pages = useModels('pages', pageIds);

  return (
    <main>
      <div className="container-fluid bg-info-100 pb-3">
        <div className="d-flex justify-content-between align-items-center border-bottom">
          <h1 className="mt-3 text-info-500">{intl.formatMessage(messages.heading)}</h1>
          <a className="btn btn-primary" href={lmsCourseURL} role="button">
            {intl.formatMessage(messages['viewLive.button'])}
          </a>
        </div>
        <PageGrid pages={pages} />
        <ResourceList />
      </div>
    </main>
  );
}

PagesAndResources.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PagesAndResources);
