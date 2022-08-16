import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Button, Form, Input, Pagination,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

import { LoadingPage } from '../../generic';
import {
  LOADING_STATUS, LibraryIndexTabs, libraryShape, LIBRARY_TYPES, paginated, ROUTES,
} from '../common';
import {
  fetchLibraryList,
  libraryListInitialState,
  selectLibraryList,
} from './data';
import LibraryListItem from './LibraryListItem';
import messages from './messages';
import commonMessages from '../common/messages';

export class LibraryListPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paginationParams: {
        page: 1,
        page_size: 20,
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

  handleFilterChange = (event) => {
    const { name, value } = event.target;
    this.setState(state => ({
      paginationParams: {
        ...state.paginationParams,
        page: 1,
      },
      filterParams: {
        ...state.filterParams,
        [name]: value,
      },
    }));
  }

  handleFilterOrgChange = (event) => {
    this.handleFilterChange(event);
    this.props.fetchLibraryList({
      params: {
        ...this.state.filterParams,
        org: event.target.value,
        page_size: this.state.paginationParams.page_size,
      },
    });
  }

  handleFilterTypeChange = (event) => {
    this.handleFilterChange(event);
    this.props.fetchLibraryList({
      params: {
        ...this.state.filterParams,
        type: event.target.value,
        page_size: this.state.paginationParams.page_size,
      },
    });
  }

  handleFilterSubmit = (event) => {
    event.preventDefault();
    this.props.fetchLibraryList({ params: this.state.filterParams });
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
    const { intl, libraries, orgs } = this.props;
    const { filterParams } = this.state;

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

    const orgOptions = [
      {
        value: '',
        label: intl.formatMessage(messages['library.list.filter.options.org.all']),
      },
      {
        label: intl.formatMessage(messages['library.list.filter.options.org.organizations']),
        group: orgs.map(orgName => ({
          value: orgName,
          label: orgName,
        })),
      },
    ];

    const typeOptions = [{
      label: intl.formatMessage(messages['library.list.filter.options.type.types']),
      group: Object.values(LIBRARY_TYPES).map((value) => (
        { value, label: intl.formatMessage(messages[`library.list.filter.options.type.${value}`]) }
      )),
    }];

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
                    onClick={this.goToCreateLibraryPage}
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
              <ul className="library-list">
                {libraries.data.map((library) => (
                  <li key={library.id} className="library-item">
                    <LibraryListItem library={library} />
                  </li>
                ))}
              </ul>
              {libraries.count > 0
                ? (
                  <Pagination
                    className="library-list-pagination"
                    paginationLabel="pagination navigation"
                    currentPage={paginationOptions.currentPage}
                    pageCount={paginationOptions.pageCount}
                    buttonLabels={paginationOptions.buttonLabels}
                    onPageSelect={this.handlePageChange}
                  />
                )
                : null}
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
              <div className="bit">
                <Form onSubmit={this.handleFilterSubmit} className="filter-form">
                  <Form.Row>
                    <Form.Group className="w-100">
                      <Form.Label className="title title-3">
                        {intl.formatMessage(messages['library.list.filter.title'])}
                      </Form.Label>
                      <div className="d-flex flex-row">
                        <Form.Control
                          name="text_search"
                          placeholder={intl.formatMessage(messages['library.list.filter.input.default'])}
                          defaultValue={filterParams ? filterParams.text_search : null}
                          onChange={this.handleFilterChange}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          className="ml-2 py-1 px-3 d-inline"
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group className="w-100">
                      <Form.Label className="title title-3">
                        {intl.formatMessage(messages['library.list.filter.options.org.label'])}
                      </Form.Label>
                      <Input
                        name="org"
                        type="select"
                        options={orgOptions}
                        defaultValue={filterParams ? filterParams.org : null}
                        onChange={this.handleFilterOrgChange}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group className="w-100">
                      <Form.Label className="title title-3">
                        {intl.formatMessage(messages['library.list.filter.options.type.label'])}
                      </Form.Label>
                      <Input
                        name="type"
                        type="select"
                        options={typeOptions}
                        defaultValue={filterParams ? filterParams.type : null}
                        onChange={this.handleFilterTypeChange}
                      />
                    </Form.Group>
                  </Form.Row>
                </Form>
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
  libraries: paginated(libraryShape).isRequired,
  orgs: PropTypes.arrayOf(PropTypes.string),
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
