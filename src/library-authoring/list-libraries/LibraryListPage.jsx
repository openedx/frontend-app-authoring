import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Button, Pagination, Breadcrumb, ActionRow, Icon, Card,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingPage } from '../../generic';
import {
  LOADING_STATUS, libraryShape, paginated, ROUTES,
} from '../common';
import { EmptyPage } from '../empty-page';
import {
  fetchLibraryList,
  libraryListInitialState,
  selectLibraryList,
} from './data';
import messages from './messages';
import commonMessages from '../common/messages';
import emptyPageMessages from '../empty-page/messages';

export class LibraryListPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paginationParams: {
        page: 1,
        page_size: +process.env.LIBRARY_LISTING_PAGINATION_PAGE_SIZE,
      },
      filterParams: {
        type: 'complex',
        text_search: '',
        org: '',
      },
    };
  }

  componentDidMount() {
    this.props.fetchLibraryList({
      params: {
        ...this.state.filterParams,
        ...this.state.paginationParams,
      },
    });
  }

  goToCreateLibraryPage = () => {
    this.props.history.push(ROUTES.List.CREATE);
  }

  handlePageChange = (selectedPage) => {
    this.setState(state => ({
      paginationParams: {
        ...state.paginationParams,
        page: selectedPage,
      },
    }));

    this.props.fetchLibraryList({
      params: {
        ...this.state.filterParams,
        ...this.state.paginationParams,
        page: selectedPage,
      },
    });
  }

  goToLibraryItem = (library) => {
    this.props.history.push(library.url);
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

    const paginationOptions = {
      currentPage: this.state.paginationParams.page,
      pageCount: Math.ceil(libraries.count / this.state.paginationParams.page_size),
      buttonLabels: {
        previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
        next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
        page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
        currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
        pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
      },
    };

    return (
      <div className="library-list-wrapper">
        <div className="wrapper-mast wrapper">
          <Breadcrumb
            links={[
              { label: intl.formatMessage(commonMessages['library.common.breadcrumbs.studio']), url: getConfig().STUDIO_BASE_URL },
            ]}
            activeLabel={intl.formatMessage(messages['library.list.breadcrumbs.libraries'])}
          />
          <header className="mast has-actions">
            <h1 className="page-header">{intl.formatMessage(messages['library.list.page.heading'])}</h1>
            <nav className="nav-actions">
              <ul className="nav-list">
                <li className="nav-item">
                  {libraries.count !== 0 && (
                  <Button
                    variant="outline-primary"
                    onClick={this.goToCreateLibraryPage}
                  >
                    {intl.formatMessage(messages['library.list.new.library'])}
                  </Button>
                  )}
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
              {libraries.count > 0
                ? (
                  <ul className="library-list">
                    {libraries.data.map(library => (
                      <Card
                        isClickable
                        key={library.id}
                        className="library-item"
                        onClick={() => this.goToLibraryItem(library)}
                      >
                        <Card.Header
                          className="library-title"
                          title={library.title}
                        />
                        <div className="library-metadata">
                          <span className="library-org metadata-item">
                            <span className="value">{library.org}</span>
                          </span>
                          <span className="library-slug metadata-item">
                            <span className="value">{library.slug}</span>
                          </span>
                        </div>
                      </Card>
                    ))}
                  </ul>
                ) : (
                  <EmptyPage
                    heading={intl.formatMessage(emptyPageMessages['library.list.empty.heading'])}
                    body={intl.formatMessage(emptyPageMessages['library.list.empty.body'])}
                  >
                    <ActionRow>
                      <Button
                        variant="outline-primary"
                        size="lg"
                        onClick={this.goToCreateLibraryPage}
                      >
                        <Icon src={Add} />
                        {intl.formatMessage(emptyPageMessages['library.list.empty.new.library'])}
                      </Button>
                    </ActionRow>
                  </EmptyPage>
                )}
              {paginationOptions.pageCount > 1
                && (
                  <Pagination
                    className="library-list-pagination"
                    paginationLabel="pagination navigation"
                    currentPage={paginationOptions.currentPage}
                    pageCount={paginationOptions.pageCount}
                    buttonLabels={paginationOptions.buttonLabels}
                    onPageSelect={this.handlePageChange}
                  />
                )}
            </article>
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
  libraries: paginated(libraryShape).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

LibraryListPage.defaultProps = libraryListInitialState;

export default connect(
  selectLibraryList,
  { fetchLibraryList },
)(injectIntl(withRouter(LibraryListPage)));
