import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  ActionRow,
  Alert,
  Button,
  Col,
  Form,
  Pagination,
  Row,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { faSearch, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LoadingPage } from '../../generic';
import {
  truncateMessage, LOADING_STATUS, paginationParamsShape, legacyFilterParamsShape,
} from '../common';
import commonMessages from '../common/messages';

import CourseImportListItem from './CourseImportListItem';
import CourseImportTaskListItem from './CourseImportTaskListItem';
import messages from './messages';
import {
  courseShape,
  importTaskShape,
  clearErrors,
  fetchImportableCourseList,
  fetchImportTasksList,
  fetchOrganizationList,
  courseImportInitialState,
  importBlocks,
  selectCourseImport,
} from './data';

export const CourseImportPageHeader = ({ intl, showCourses, ...props }) => {
  const showCoursesHandler = () => {
    props.setShowCourses(!showCourses);
  };

  return (
    <div className="wrapper-mast wrapper">
      <header className="mast has-actions has-navigation has-subtitle">
        <small className="subtitle">{intl.formatMessage(messages['library.course_import.page.parent_heading'])}</small>
        <ActionRow>
          <h1 className="page-header-title">{intl.formatMessage(messages['library.course_import.page.heading'])}</h1>
          <ActionRow.Spacer />
          <Button className="toggle-importable-courses" variant="primary" onClick={showCoursesHandler}>
            <FontAwesomeIcon icon={faSync} className="pr-1" />
            {showCourses
              ? intl.formatMessage(messages['library.course_import.importable_courses.hide'])
              : intl.formatMessage(messages['library.course_import.importable_courses.show'])}
          </Button>
        </ActionRow>
      </header>
    </div>
  );
};

CourseImportPageHeader.defaultProps = {};
CourseImportPageHeader.propTypes = {
  intl: intlShape.isRequired,
  showCourses: PropTypes.bool.isRequired,
  setShowCourses: PropTypes.func.isRequired,
};

export const CourseImportList = ({
  intl, libraryId, courses, courseCount, ongoingImports, paginationParams, importBlocksHandler, taskPaginationParams,
  ...props
}) => {
  const paginationOptions = {
    currentPage: paginationParams.page,
    pageCount: Math.ceil(courseCount / paginationParams.page_size),
    buttonLabels: {
      previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
      next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
      page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
      currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
      pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
    },
  };

  const handlePagination = (page) => {
    props.setPaginationParams({
      ...paginationParams,
      page,
    });
  };

  const renderContent = () => (
    <div className="importable-course-list-container mb-4">
      {
        courseCount > 0
          ? (
            <ul className="library-list list-unstyled">
              {courses.map((course) => (
                <li className="library-item" key={course.id}>
                  <CourseImportListItem
                    libraryId={libraryId}
                    course={course}
                    importBlocksHandler={importBlocksHandler}
                    taskPaginationParams={taskPaginationParams}
                    ongoingImportState={ongoingImports[course.id]}
                  />
                </li>
              ))}
            </ul>
          )
          : <h3 className="">{intl.formatMessage(messages['library.course_import.importable_courses.no_item'])}</h3>
      }

      {
        paginationOptions.pageCount > 0
          ? (
            <Pagination
              className="library-list-pagination"
              paginationLabel="pagination navigation"
              currentPage={paginationOptions.currentPage}
              pageCount={paginationOptions.pageCount}
              buttonLabels={paginationOptions.buttonLabels}
              onPageSelect={handlePagination}
            />
          )
          : null
      }
    </div>
  );

  return props.isLoading ? props.loadingHandler() : renderContent();
};

CourseImportList.defaultProps = {};
CourseImportList.propTypes = {
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadingHandler: PropTypes.func.isRequired,
  libraryId: PropTypes.string.isRequired,
  courses: PropTypes.arrayOf(courseShape),
  courseCount: PropTypes.number.isRequired,
  importBlocksHandler: PropTypes.func.isRequired,
  ongoingImports: PropTypes.objectOf(PropTypes.object),
  paginationParams: paginationParamsShape.isRequired,
  setPaginationParams: PropTypes.func.isRequired,
  taskPaginationParams: paginationParamsShape.isRequired,
};

export const CourseImportListFilter = ({
  intl, organizations, filterParams, ...props
}) => {
  const orgOptions = [
    {
      key: 'all',
      value: '',
      label: intl.formatMessage(messages['library.course_import.course_filter.options.org.all']),
    },
    {
      key: 'organizations',
      label: intl.formatMessage(messages['library.course_import.course_filter.options.org.organizations']),
      group: organizations.map(organization => ({
        key: organization,
        value: organization,
        label: organization,
      })),
    },
  ];

  const handleOrgChange = (event) => {
    props.setFilterParams({
      ...filterParams,
      org: event.target.value,
    });
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    props.setFilterParams({
      ...filterParams,
      search_term: event.target.querySelector('[name="search_term"]').value.trim(),
    });
  };

  const renderOption = option => {
    if (option.group) {
      return (
        <optgroup key={option.key} label={option.label}>
          {option.group.map(renderOption)}
        </optgroup>
      );
    }
    return (
      <option value={option.value} key={option.value}>{option.label}</option>
    );
  };

  return (
    <>
      <div className="bit">
        <h3 className="title title-3">{intl.formatMessage(messages['library.course_import.aside.course_list.title'])}</h3>
        <p>{intl.formatMessage(messages['library.course_import.aside.course_list.text.first'])}</p>
        <p>{intl.formatMessage(messages['library.course_import.aside.course_list.text.second'])}</p>
      </div>

      <div className="bit">
        <Form onSubmit={handleFilterSubmit} className="filter-form">
          <Form.Row>
            <Form.Group className="w-100">
              <Form.Label className="title title-3">
                {intl.formatMessage(messages['library.course_import.course_filter.title'])}
              </Form.Label>
              <div className="d-flex flex-row">
                <Form.Control
                  name="search_term"
                  placeholder={intl.formatMessage(messages['library.course_import.course_filter.input.default'])}
                  defaultValue={filterParams ? filterParams.search_term : null}
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
                {intl.formatMessage(messages['library.course_import.course_filter.options.org.label'])}
              </Form.Label>
              <Form.Control
                name="org"
                as="select"
                defaultValue={filterParams ? filterParams.org : null}
                onChange={handleOrgChange}
              >
                {orgOptions.map(renderOption)}
              </Form.Control>
            </Form.Group>
          </Form.Row>
        </Form>
      </div>
    </>
  );
};

CourseImportListFilter.defaultProps = {};
CourseImportListFilter.propTypes = {
  intl: intlShape.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.string).isRequired,
  filterParams: legacyFilterParamsShape.isRequired,
  setFilterParams: PropTypes.func.isRequired,
};

export const ImportTaskList = ({
  intl, tasks, taskCount, paginationParams, ...props
}) => {
  const paginationOptions = {
    currentPage: paginationParams.page,
    pageCount: Math.ceil(taskCount / paginationParams.page_size),
    buttonLabels: {
      previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
      next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
      page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
      currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
      pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
    },
  };

  const handlePagination = (page) => {
    props.setPaginationParams({
      ...paginationParams,
      page,
    });
  };

  const renderContent = () => (
    <div className="import-task-list-container">
      {
        taskCount > 0
          ? (
            <ul className="library-list list-unstyled">
              {tasks.map((task) => (
                <li key={task.course_id}>
                  <CourseImportTaskListItem task={task} />
                </li>
              ))}
            </ul>
          )
          : <h3 className="">{intl.formatMessage(messages['library.course_import.import_tasks.no_item'])}</h3>
      }

      {
        paginationOptions.pageCount > 0
          ? (
            <Pagination
              className="library-list-pagination"
              paginationLabel="pagination navigation"
              currentPage={paginationOptions.currentPage}
              pageCount={paginationOptions.pageCount}
              buttonLabels={paginationOptions.buttonLabels}
              onPageSelect={handlePagination}
            />
          )
          : null
      }
    </div>
  );

  return props.isLoading ? props.loadingHandler() : renderContent();
};

ImportTaskList.defaultProps = {};
ImportTaskList.propTypes = {
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadingHandler: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(importTaskShape),
  taskCount: PropTypes.number.isRequired,
  paginationParams: paginationParamsShape.isRequired,
  setPaginationParams: PropTypes.func.isRequired,
};

export const CourseImportPage = ({
  intl, courses, courseCount, importTasks, importTaskCount, ongoingImports, organizations, ...props
}) => {
  const { libraryId } = props.match.params;
  const { authenticatedUser } = useContext(AppContext);
  const isCourseImportListLoading = (
    props.coursesLoadingStatus === LOADING_STATUS.LOADING
    || props.organizationsLoadingStatus === LOADING_STATUS.LOADING
  );

  const [showCourses, setShowCourses] = useState(false);
  const [filterParams, setFilterParams] = useState(props.defaultFilterParams);
  const [coursePaginationParams, setCoursePaginationParams] = useState(props.defaultPaginationParams);
  const [taskPaginationParams, setTaskPaginationParams] = useState(props.defaultPaginationParams);

  useEffect(() => {
    props.fetchOrganizationList();
  }, []);

  useEffect(() => {
    props.fetchImportTasksList({
      params: {
        libraryId,
        taskPaginationParams,
        authenticatedUser,
      },
    });
  }, [libraryId, taskPaginationParams]);

  useEffect(() => {
    props.fetchImportableCourseList({
      params: {
        filterParams,
        coursePaginationParams,
        authenticatedUser,
      },
    });
  }, [filterParams, coursePaginationParams]);

  const loadingHandler = () => (
    <LoadingPage loadingMessage={intl.formatMessage(messages['library.course_import.loading.message'])} />
  );

  return (
    <div className="container-fluid">
      <div className="library-list-wrapper">
        <CourseImportPageHeader
          intl={intl}
          showCourses={showCourses}
          setShowCourses={setShowCourses}
        />

        <div className="wrapper-content wrapper">
          <Row className="content mt-3">
            <Col xs={12} md={8} xl={9}>
              <article className="content-primary" role="main">
                {props.errorMessage && (
                  <Alert
                    variant="danger"
                    onClose={props.clearErrors}
                    dismissible
                  >
                    {truncateMessage(props.errorMessage)}
                  </Alert>
                )}
                {showCourses && (
                  <CourseImportList
                    intl={intl}
                    isLoading={isCourseImportListLoading}
                    loadingHandler={loadingHandler}
                    libraryId={libraryId}
                    courses={courses}
                    courseCount={courseCount}
                    importBlocksHandler={props.importBlocks}
                    ongoingImports={ongoingImports}
                    paginationParams={coursePaginationParams}
                    setPaginationParams={setCoursePaginationParams}
                    taskPaginationParams={taskPaginationParams}
                  />
                )}
                <ImportTaskList
                  intl={intl}
                  isLoading={props.importTasksLoadingStatus === LOADING_STATUS.LOADING}
                  loadingHandler={loadingHandler}
                  tasks={importTasks}
                  taskCount={importTaskCount}
                  paginationParams={taskPaginationParams}
                  setPaginationParams={setTaskPaginationParams}
                />
              </article>
            </Col>
            <Col xs={12} md={4} xl={3}>
              <aside className="content-supplementary">
                <div className="bit">
                  <h3 className="title title-3">{intl.formatMessage(messages['library.course_import.aside.import_task_list.title'])}</h3>
                  <p>{intl.formatMessage(messages['library.course_import.aside.import_task_list.text.first'])}</p>
                  <p>{intl.formatMessage(messages['library.course_import.aside.import_task_list.text.second'])}</p>
                </div>

                {
                  showCourses && (
                  <CourseImportListFilter
                    intl={intl}
                    organizations={organizations}
                    filterParams={filterParams}
                    setFilterParams={setFilterParams}
                  />
                  )
                }
              </aside>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

CourseImportPage.defaultProps = {
  ...courseImportInitialState,
  defaultPaginationParams: {
    page: 1,
    page_size: 20,
  },
  defaultFilterParams: {
    org: '',
    search_term: '',
  },
};

CourseImportPage.propTypes = {
  intl: intlShape.isRequired,
  errorMessage: PropTypes.string,
  courses: PropTypes.arrayOf(courseShape),
  courseCount: PropTypes.number.isRequired,
  importTasks: PropTypes.arrayOf(importTaskShape),
  importTaskCount: PropTypes.number.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.string),
  ongoingImports: PropTypes.objectOf(PropTypes.object),
  organizationsLoadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
  coursesLoadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
  importBlocksLoadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
  importTasksLoadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,

  clearErrors: PropTypes.func.isRequired,
  fetchImportableCourseList: PropTypes.func.isRequired,
  fetchImportTasksList: PropTypes.func.isRequired,
  fetchOrganizationList: PropTypes.func.isRequired,
  importBlocks: PropTypes.func.isRequired,

  defaultPaginationParams: paginationParamsShape,
  defaultFilterParams: legacyFilterParamsShape,

  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default connect(selectCourseImport, {
  clearErrors,
  fetchImportableCourseList,
  fetchImportTasksList,
  fetchOrganizationList,
  importBlocks,
})(injectIntl(withRouter(CourseImportPage)));
