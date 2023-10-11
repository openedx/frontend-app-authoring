import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getCourseUpdatesApiUrl,
  getCourseHandoutApiUrl,
  updateCourseUpdatesApiUrl,
} from './data/api';
import {
  createCourseUpdateQuery,
  deleteCourseUpdateQuery,
  editCourseHandoutsQuery,
  editCourseUpdateQuery,
} from './data/thunk';
import initializeStore from '../store';
import { executeThunk } from '../utils';
import { courseUpdatesMock, courseHandoutsMock } from './__mocks__';
import CourseUpdates from './CourseUpdates';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

jest.mock('@edx/frontend-lib-content-components', () => ({
  TinyMceWidget: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseUpdates courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseUpdates />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseUpdatesApiUrl(courseId))
      .reply(200, courseUpdatesMock);
    axiosMock
      .onGet(getCourseHandoutApiUrl(courseId))
      .reply(200, courseHandoutsMock);
  });

  it('render CourseUpdates component correctly', async () => {
    const {
      getByText, getAllByTestId, getByTestId, getByRole,
    } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.sectionInfo.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeInTheDocument();
      expect(getAllByTestId('course-update')).toHaveLength(3);
      expect(getByTestId('course-handouts')).toBeInTheDocument();
    });
  });

  it('should create course update', async () => {
    const { getByText } = render(<RootWrapper />);

    const data = {
      content: '<p>Some text</p>',
      date: 'August 29, 2023',
    };

    axiosMock
      .onPost(getCourseUpdatesApiUrl(courseId))
      .reply(200, data);

    await executeThunk(createCourseUpdateQuery(courseId, data), store.dispatch);
    expect(getByText('Some text')).toBeInTheDocument();
    expect(getByText(data.date)).toBeInTheDocument();
  });

  it('should edit course update', async () => {
    const { getByText, queryByText } = render(<RootWrapper />);

    const data = {
      id: courseUpdatesMock[0].id,
      content: '<p>Some text</p>',
      date: 'August 29, 2023',
    };

    axiosMock
      .onPut(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
      .reply(200, data);

    await executeThunk(editCourseUpdateQuery(courseId, data), store.dispatch);
    expect(getByText('Some text')).toBeInTheDocument();
    expect(getByText(data.date)).toBeInTheDocument();
    expect(queryByText(courseUpdatesMock[0].date)).not.toBeInTheDocument();
    expect(queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
  });

  it('should delete course update', async () => {
    const { queryByText } = render(<RootWrapper />);

    axiosMock
      .onDelete(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
      .reply(200);

    await executeThunk(deleteCourseUpdateQuery(courseId, courseUpdatesMock[0].id), store.dispatch);
    expect(queryByText(courseUpdatesMock[0].date)).not.toBeInTheDocument();
    expect(queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
  });

  it('should edit course handouts', async () => {
    const { getByText, queryByText } = render(<RootWrapper />);

    const data = {
      ...courseHandoutsMock,
      data: '<p>Some handouts 1</p>',
    };

    axiosMock
      .onPut(getCourseHandoutApiUrl(courseId))
      .reply(200, data);

    await executeThunk(editCourseHandoutsQuery(courseId, data), store.dispatch);
    expect(getByText('Some handouts 1')).toBeInTheDocument();
    expect(queryByText(courseHandoutsMock.data)).not.toBeInTheDocument();
  });

  it('Add new update form is visible after clicking "New update" button', async () => {
    const { getByText, getByRole, getAllByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      const editUpdateButtons = getAllByTestId('course-update-edit-button');
      const deleteButtons = getAllByTestId('course-update-delete-button');
      const editHandoutsButtons = getAllByTestId('course-handouts-edit-button');
      const newUpdateButton = getByRole('button', { name: messages.newUpdateButton.defaultMessage });

      fireEvent.click(newUpdateButton);

      expect(newUpdateButton).toBeDisabled();
      editUpdateButtons.forEach((button) => expect(button).toBeDisabled());
      editHandoutsButtons.forEach((button) => expect(button).toBeDisabled());
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
      expect(getByText('Add new update')).toBeInTheDocument();
    });
  });

  it('Edit handouts form is visible after clicking "Edit" button', async () => {
    const { getByText, getByRole, getAllByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      const editUpdateButtons = getAllByTestId('course-update-edit-button');
      const deleteButtons = getAllByTestId('course-update-delete-button');
      const editHandoutsButtons = getAllByTestId('course-handouts-edit-button');
      const editHandoutsButton = editHandoutsButtons[0];

      fireEvent.click(editHandoutsButton);

      expect(editHandoutsButton).toBeDisabled();
      expect(getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeDisabled();
      editUpdateButtons.forEach((button) => expect(button).toBeDisabled());
      editHandoutsButtons.forEach((button) => expect(button).toBeDisabled());
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
      expect(getByText('Edit handouts')).toBeInTheDocument();
    });
  });

  it('Edit update form is visible after clicking "Edit" button', async () => {
    const {
      getByText, getByRole, getAllByTestId, queryByText,
    } = render(<RootWrapper />);

    await waitFor(() => {
      const editUpdateButtons = getAllByTestId('course-update-edit-button');
      const deleteButtons = getAllByTestId('course-update-delete-button');
      const editHandoutsButtons = getAllByTestId('course-handouts-edit-button');
      const editUpdateFirstButton = editUpdateButtons[0];

      fireEvent.click(editUpdateFirstButton);
      expect(getByText('Edit update')).toBeInTheDocument();
      expect(getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeDisabled();
      editUpdateButtons.forEach((button) => expect(button).toBeDisabled());
      editHandoutsButtons.forEach((button) => expect(button).toBeDisabled());
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
      expect(queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
    });
  });
});
