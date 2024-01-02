import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { CourseImportPage } from '../CourseImportPage';
import { courseImportInitialState } from '../data';
import { LOADING_STATUS } from '../../common';
import { userFactoryLine } from '../../common/specs/factories';
import { ctxMount } from '../../common/specs/helpers';

const InjectedCourseImportPage = injectIntl(CourseImportPage);

describe('course-import/CourseImportPage/CourseImportPage.jsx', () => {
  let props;
  let mockFetchImportTasksList;
  let mockFetchOrganizationList;
  let mockFetchImportableCourseList;
  let mockClearErrors;
  let mockImportBlocks;

  beforeEach(() => {
    mockFetchImportTasksList = jest.fn();
    mockFetchOrganizationList = jest.fn();
    mockFetchImportableCourseList = jest.fn();
    mockClearErrors = jest.fn();
    mockImportBlocks = jest.fn();

    props = {
      ...courseImportInitialState,
      fetchImportTasksList: mockFetchImportTasksList,
      fetchOrganizationList: mockFetchOrganizationList,
      fetchImportableCourseList: mockFetchImportableCourseList,
      importTasksLoadingStatus: LOADING_STATUS.LOADED,
      coursesLoadingStatus: LOADING_STATUS.LOADED,
      organizationsLoadingStatus: LOADING_STATUS.LOADED,
      clearErrors: mockClearErrors,
      importBlocks: mockImportBlocks,
    };
  });

  it('renders course import page without error', () => {
    const currentUser = userFactoryLine()[-1];

    ctxMount(
      <BrowserRouter>
        <InjectedCourseImportPage {...props} />
      </BrowserRouter>,
      { context: { authenticatedUser: currentUser } },
    );
  });

  it('renders course import items', () => {
    const currentUser = userFactoryLine()[-1];

    props.courses = [
      {
        id: 'course-123',
        org: 'edx',
        title: 'Test course',
      },
      {
        id: 'course-1233',
        org: 'edx2',
        title: 'Test course 2',
      },
    ];
    props.courseCount = props.courses.length;

    const container = ctxMount(
      <BrowserRouter>
        <InjectedCourseImportPage {...props} />
      </BrowserRouter>,
      { context: { authenticatedUser: currentUser } },
    );

    const showCoursesButton = container.find('.toggle-importable-courses').at(1);
    showCoursesButton.simulate('click');

    expect(container.find('.library-list').length).toBe(1);
    expect(container.find('.library-list .library-item').length).toBe(2);

    expect(container.find('.importable-course-list-container').length).toBe(1);
  });

  it('renders course import tasks', () => {
    const currentUser = userFactoryLine()[-1];

    props.importTasks = [{
      id: 1,
      progress: 1,
      library: 1,
      state: 'Pending',
      org: 'edx',
      course_id: 'course-1',
      created_at: '1970-01-01',
      updated_at: '1970-01-01',
    }];

    props.importTaskCount = props.importTasks.length;

    const container = ctxMount(
      <BrowserRouter>
        <InjectedCourseImportPage {...props} />
      </BrowserRouter>,
      { context: { authenticatedUser: currentUser } },
    );

    expect(container.find('.import-task-list-container').length).toBe(1);
    expect(container.find('.import-task-list-container .library-list').length).toBe(1);
  });
});
