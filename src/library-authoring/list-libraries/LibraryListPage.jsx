import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { LoadingPage } from '../../generic';
import { LOADING_STATUS, LibraryIndexTabs, libraryShape } from '../common';
import { LibraryCreateForm } from '../create-library';
import {
  fetchLibraryList,
  libraryListInitialState,
  selectLibraryList,
} from './data';
import LibraryListItem from './LibraryListItem';
import messages from './messages';

class LibraryListPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
    };
  }

  componentDidMount() {
    this.props.fetchLibraryList();
  }

  showForm = () => {
    this.setState({
      showForm: true,
    });
  }

  hideForm = () => {
    this.setState({
      showForm: false,
    });
  }

  renderError() {
    const { intl, errorMessage } = this.props;

    return (
      <div>
        {intl.formatMessage(messages['library.list.loading.error'], { errorMessage })}
      </div>
    );
  }

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.list.loading.message'])} />
    );
  }

  renderContent() {
    const { intl, libraries } = this.props;
    const { showForm } = this.state;

    return (
      <div className="library-list-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions">
            <h1 className="page-header">{intl.formatMessage(messages['library.list.page.heading'])}</h1>
            <nav className="nav-actions">
              <ul>
                <li className="nav-item">
                  <Button
                    variant="success"
                    onClick={this.showForm}
                  >
                    <FontAwesomeIcon icon={faPlus} className="pr-3" />
                    {intl.formatMessage(messages['library.list.new.library'])}
                  </Button>
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
              <LibraryIndexTabs />
              {showForm
              && <LibraryCreateForm hideForm={this.hideForm} />}
              <ul className="library-list">
                {libraries.map((library) => (
                  <li key={library.id} className="library-item">
                    <LibraryListItem library={library} />
                  </li>
                ))}
              </ul>
            </article>
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.list.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.list.aside.text'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {intl.formatMessage(messages['library.list.aside.help.link'])}
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

LibraryListPage.contextType = AppContext;

LibraryListPage.propTypes = {
  errorMessage: PropTypes.string,
  fetchLibraryList: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  libraries: PropTypes.arrayOf(libraryShape),
  status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

LibraryListPage.defaultProps = libraryListInitialState;

export default connect(
  selectLibraryList,
  { fetchLibraryList },
)(injectIntl(LibraryListPage));
