import {
  render, waitFor, fireEvent,
} from '@testing-library/react';
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
import { RequestStatus } from '../data/constants';
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

jest.mock('../editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="es">
      <CourseUpdates courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseUpdates />', () => {
  describe('Successful API responses', () => {
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

  describe('page load failure API responses', () => {
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
    });

    it('Course updates fetch should show updates loading error', async () => {
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(404);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(200, courseHandoutsMock);

      const {
        getByText, queryByTestId, getByRole,
      } = render(<RootWrapper />);

      await waitFor(() => {
        const newButton = getByRole('button', { name: messages.newUpdateButton.defaultMessage });
        expect(getByText(messages.loadingUpdatesErrorTitle.defaultMessage));
        expect(newButton).toBeDisabled();
        expect(getByText(messages.noCourseUpdates.defaultMessage)).toBeVisible();
        expect(queryByTestId('course-update')).toBeNull();
      });
    });

    it('Course handouts fetch should show handouts loading error', async () => {
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(200, courseUpdatesMock);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(404);

      const {
        getByText, getByTestId,
      } = render(<RootWrapper />);

      await waitFor(() => {
        expect(getByText(messages.loadingHandoutsErrorTitle.defaultMessage));
        expect(getByTestId('course-handouts-edit-button')).toBeDisabled();
      });
    });

    it('displays an alert and sets status to DENIED when API responds with 403', async () => {
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(403, courseUpdatesMock);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(403);

      const { getByTestId } = render(<RootWrapper />);

      await waitFor(() => {
        expect(getByTestId('connectionErrorAlert')).toBeInTheDocument();
        const { loadingStatuses } = store.getState().courseUpdates;
        Object.values(loadingStatuses)
          .some(status => expect(status).toEqual(RequestStatus.DENIED));
      });
    });
  });

  describe('saving failure API responses', () => {
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
    it('creating new update should show saving error alert', async () => {
      const { getByText, queryByText } = render(<RootWrapper />);

      const data = {
        content: '<p>Some text</p>',
        date: 'August 29, 2023',
      };

      axiosMock
        .onPost(getCourseUpdatesApiUrl(courseId), data)
        .reply(404);

      await executeThunk(createCourseUpdateQuery(courseId, data), store.dispatch);
      expect(getByText(messages.savingNewUpdateErrorAlertDescription.defaultMessage)).toBeVisible();
      expect(queryByText('Some text')).toBeNull();
      expect(queryByText(data.date)).toBeNull();
    });

    it('editing course update should show saving error alert', async () => {
      const { getByText, queryByText } = render(<RootWrapper />);

      const data = {
        id: courseUpdatesMock[0].id,
        content: '<p>Some text</p>',
        date: 'August 29, 2023',
      };

      axiosMock
        .onPut(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(404);

      await executeThunk(editCourseUpdateQuery(courseId, data), store.dispatch);
      expect(queryByText('Some text')).toBeNull();
      expect(queryByText(data.date)).toBeNull();
      expect(getByText(courseUpdatesMock[0].date)).toBeVisible();
      expect(getByText(courseUpdatesMock[0].content)).toBeVisible();
      expect(getByText(messages.savingUpdatesErrorDescription.defaultMessage)).toBeVisible();
    });

    it('deleting course update should show delete saving error alert', async () => {
      const { getByText } = render(<RootWrapper />);

      axiosMock
        .onDelete(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(404);

      await executeThunk(deleteCourseUpdateQuery(courseId, courseUpdatesMock[0].id), store.dispatch);
      expect(getByText(courseUpdatesMock[0].date)).toBeVisible();
      expect(getByText(courseUpdatesMock[0].content)).toBeVisible();
      expect(getByText(messages.deletingUpdatesErrorDescription.defaultMessage)).toBeVisible();
    });

    it('editing course handouts should show saving error alert', async () => {
      const { getByText, queryByText } = render(<RootWrapper />);

      const data = {
        ...courseHandoutsMock,
        data: '<p>Some handouts 1</p>',
      };

      axiosMock
        .onPut(getCourseHandoutApiUrl(courseId))
        .reply(404);

      await executeThunk(editCourseHandoutsQuery(courseId, data), store.dispatch);
      expect(queryByText('Some handouts 1')).toBeNull();
      expect(getByText(courseHandoutsMock.data)).toBeVisible();
      expect(getByText(messages.savingHandoutsErrorDescription.defaultMessage));
    });
  });
});
