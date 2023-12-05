import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Breadcrumb, Button, Pagination, ActionRow, Card,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
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
import { withNavigate } from '../utils/hoc';

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
    this.props.navigate(ROUTES.List.CREATE);
  };

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
  };

  goToLibraryItem = (library) => {
    this.props.navigate(library.url);
  };

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
    const { config } = this.context;

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
      <>
        {libraries.count !== 0 && (
          <div className="wrapper-mast wrapper">
            <Breadcrumb
              activeLabel={intl.formatMessage(messages['library.form.breadcrumbs.list'])}
              links={[
                { label: intl.formatMessage(messages['library.form.breadcrumbs.home']), url: config.STUDIO_BASE_URL },
              ]}
            />
            <header className="mast has-actions">
              <ActionRow className="mb-4">
                <h2 className="page-header text-primary-500">{intl.formatMessage(messages['library.list.page.heading'])}</h2>
                <ActionRow.Spacer />
                <Button
                  variant="primary"
                  onClick={this.goToCreateLibraryPage}
                  size="sm"
                >
                  {intl.formatMessage(messages['library.list.new.library'])}
                </Button>
              </ActionRow>
            </header>
          </div>
        )}
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
              {libraries.count > 0
                ? (
                  <ul className="list-unstyled">
                    {libraries.data.map(library => (
                      <Card
                        isClickable
                        key={library.id}
                        className="library-item mt-2 p-1"
                        onClick={() => this.goToLibraryItem(library)}
                      >
                        <Card.Section title={<h4 className="text-primary-500">{library.title}</h4>}>
                          <span className="small text-gray-500">
                            {library.org} <span className="micro text-light-700">•</span> {library.slug}
                          </span>
                        </Card.Section>
                      </Card>
                    ))}
                  </ul>
                ) : (
                  <EmptyPage
                    heading={intl.formatMessage(emptyPageMessages['library.list.empty.heading'])}
                    body={intl.formatMessage(emptyPageMessages['library.list.empty.body'])}
                  >
                    <Button
                      variant="outline-primary"
                      onClick={this.goToCreateLibraryPage}
                      iconBefore={Add}
                      size="sm"
                    >
                      {intl.formatMessage(emptyPageMessages['library.list.empty.new.library'])}
                    </Button>
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
      </>
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
  navigate: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

LibraryListPage.defaultProps = libraryListInitialState;

export default connect(
  selectLibraryList,
  { fetchLibraryList },
)(injectIntl(withNavigate(LibraryListPage)));
