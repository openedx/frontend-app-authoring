/*
Library Access Page. This component handles team permissions access.
 */
import React, { useEffect} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import messages from './messages';
import { LoadingPage } from '../../generic';
import { fetchLibraryDetail } from '../author-library/data';
import {
  libraryShape, LOADING_STATUS,
} from '../common/data';
import {
  courseImportInitialState,
  selectCourseImport
} from './data';

/**
 * CourseImportPage:
 * Template component for the course import page for libraries.
 */
const CourseImportPage = ({
  intl, library
}) => (
  <div className="import-course-wrapper">
    <div className="wrapper-mast wrapper">
      <header className="mast has-actions has-navigation has-subtitle">
        <div className="page-header">
          <small className="subtitle">{intl.formatMessage(messages['library.courseImport.page.parent_heading'])}</small>
          <h1 className="page-header-title">{intl.formatMessage(messages['library.courseImport.page.heading'])}</h1>
        </div>
      </header>
    </div>
    <div className="wrapper-content wrapper">
      <section className="content">
        <article className="content-primary" role="main">
          { library }
        </article>
        <aside className="content-supplementary">
          <div className="bit">
            <h3 className="title title-3">{intl.formatMessage(messages['library.courseImport.aside.title'])}</h3>
            <p>{intl.formatMessage(messages['library.courseImport.aside.text.first'])}</p>
            <p>{intl.formatMessage(messages['library.courseImport.aside.text.second'])}</p>
          </div>
        </aside>
      </section>
    </div>
  </div>
);

CourseImportPage.defaultProps = { ...courseImportInitialState };

CourseImportPage.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
};

/**
 * CourseImportPageContainer:
 * Widget for editing the list of users with access to this content library.
 * This wraps CourseImportPage and handles API calls to fetch/write data, as well as displaying
 * a loading message during initial loading. This separation allows CourseImportPage to be tested
 * in unit tests without needing to mock the API.
 */
const CourseImportPageContainer = ({
  intl, ...props
}) => {

  // Explicit empty dependencies means on mount.
  useEffect(() => {
    const { libraryId } = props.match.params;
    if (props.library === null) {
      props.fetchLibraryDetail({ libraryId });
    }
  }, []);

  const renderLoading = () => (
    <LoadingPage loadingMessage={intl.formatMessage(messages['library.courseImport.loading.message'])} />
  );

  const renderContent = () => (
    <CourseImportPage
      intl={intl}
    />
  );

  let content;
  if (props.loadingStatus === LOADING_STATUS.LOADING) {
    content = renderLoading();
  } else {
    content = renderContent();
  }

  return (
    <div className="container-fluid">
      {content}
    </div>
  );
};

CourseImportPageContainer.propTypes = {
  // errorMessage: PropTypes.string,
  intl: intlShape.isRequired,
  library: libraryShape,
  loadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

CourseImportPageContainer.defaultProps = { ...courseImportInitialState };

export default connect(
  selectCourseImport,
  {
    fetchLibraryDetail,
  },
)(injectIntl(withRouter(CourseImportPageContainer)));
