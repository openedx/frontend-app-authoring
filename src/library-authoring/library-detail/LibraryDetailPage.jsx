import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { LoadingPage } from '../../generic';
import { LOADING_STATUS, libraryShape } from '../common';
import { fetchLibraryDetail, libraryDetailInitialState, selectLibraryDetail } from './data';
import messages from './messages';

class LibraryDetailPage extends React.Component {
  componentDidMount() {
    const { libraryId } = this.props.match.params;
    this.props.fetchLibraryDetail({ libraryId });
  }

  renderError() {
    const { intl, errorMessage } = this.props;

    return (
      <div>
        {intl.formatMessage(messages['library.detail.loading.error'], { errorMessage })}
      </div>
    );
  }

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />
    );
  }

  renderContent() {
    const { intl, library } = this.props;

    return (
      <div className="library-detail-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions has-navigation has-subtitle">
            <div className="page-header">
              <small className="subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
              <h1 className="page-header-title">{library.title}</h1>
            </div>
            <nav className="nav-actions">
              <ul>
                <li className="nav-item">
                  <Button className="btn-success">
                    <FontAwesomeIcon icon={faPlus} className="pr-3 icon-inline" />
                    {intl.formatMessage(messages['library.detail.new.component'])}
                  </Button>
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main" />
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.detail.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.detail.aside.text.1'])}</p>
                <p>{intl.formatMessage(messages['library.detail.aside.text.2'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {intl.formatMessage(messages['library.detail.aside.help.link'])}
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </div>
    );
  }

  render() {
    const { status } = this.props;

    let content;
    if (status === LOADING_STATUS.FAILED) {
      content = this.renderError();
    } else if (status === LOADING_STATUS.LOADING) {
      content = this.renderLoading();
    } else if (status === LOADING_STATUS.LOADED) {
      content = this.renderContent();
    }

    return (
      <div className="container-fluid">
        {content}
      </div>
    );
  }
}

LibraryDetailPage.contextType = AppContext;

LibraryDetailPage.propTypes = {
  errorMessage: PropTypes.string,
  fetchLibraryDetail: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

LibraryDetailPage.defaultProps = libraryDetailInitialState;

export default connect(
  selectLibraryDetail,
  { fetchLibraryDetail },
)(injectIntl(LibraryDetailPage));
