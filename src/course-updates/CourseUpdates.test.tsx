import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { executeThunk } from '@src/utils';
import { RequestStatus } from '@src/data/constants';
import {
  initializeMocks, render, waitFor, fireEvent, screen,
} from '@src/testUtils';

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
  <CourseAuthoringProvider courseId={courseId}>
    <CourseUpdates />
  </CourseAuthoringProvider>
);

describe('<CourseUpdates />', () => {
  describe('Successful API responses', () => {
    beforeEach(() => {
      const mocks = initializeMocks();

      store = mocks.reduxStore;
      axiosMock = mocks.axiosMock;
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(200, courseUpdatesMock);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(200, courseHandoutsMock);
    });

    it('render CourseUpdates component correctly', async () => {
      render(<RootWrapper />);
      expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.sectionInfo.defaultMessage)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeInTheDocument();
      expect(screen.getAllByTestId('course-update')).toHaveLength(3);
      expect(screen.getByTestId('course-handouts')).toBeInTheDocument();
    });

    it('should create course update', async () => {
      const data = {
        content: '<p>Some text</p>',
        date: 'August 29, 2023',
      };

      axiosMock
        .onPost(getCourseUpdatesApiUrl(courseId))
        .reply(200, data);

      render(<RootWrapper />);

      await executeThunk(createCourseUpdateQuery(courseId, data), store.dispatch);
      expect(screen.getByText('Some text')).toBeInTheDocument();
      expect(screen.getByText(data.date)).toBeInTheDocument();
    });

    it('should edit course update', async () => {
      const data = {
        id: courseUpdatesMock[0].id,
        content: '<p>Some text</p>',
        date: 'August 29, 2023',
      };

      axiosMock
        .onPut(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(200, data);

      render(<RootWrapper />);

      await executeThunk(editCourseUpdateQuery(courseId, data), store.dispatch);
      expect(screen.getByText('Some text')).toBeInTheDocument();
      expect(screen.getByText(data.date)).toBeInTheDocument();
      expect(screen.queryByText(courseUpdatesMock[0].date)).not.toBeInTheDocument();
      expect(screen.queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
    });

    it('should delete course update', async () => {
      axiosMock
        .onDelete(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(200);

      render(<RootWrapper />);

      await executeThunk(deleteCourseUpdateQuery(courseId, courseUpdatesMock[0].id), store.dispatch);
      expect(screen.queryByText(courseUpdatesMock[0].date)).not.toBeInTheDocument();
      expect(screen.queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
    });

    it('should edit course handouts', async () => {
      const data = {
        ...courseHandoutsMock,
        data: '<p>Some handouts 1</p>',
      };

      axiosMock
        .onPut(getCourseHandoutApiUrl(courseId))
        .reply(200, data);

      render(<RootWrapper />);

      await executeThunk(editCourseHandoutsQuery(courseId, data), store.dispatch);
      expect(screen.getByText('Some handouts 1')).toBeInTheDocument();
      expect(screen.queryByText(courseHandoutsMock.data)).not.toBeInTheDocument();
    });

    it('Add new update form is visible after clicking "New update" button', async () => {
      render(<RootWrapper />);
      const editUpdateButtons = await screen.findAllByTestId('course-update-edit-button');
      const deleteButtons = await screen.findAllByTestId('course-update-delete-button');
      const editHandoutsButtons = await screen.findAllByTestId('course-handouts-edit-button');
      const newUpdateButton = await screen.findByRole('button', { name: messages.newUpdateButton.defaultMessage });

      fireEvent.click(newUpdateButton);

      expect(newUpdateButton).toBeDisabled();
      editUpdateButtons.forEach((button) => expect(button).toBeDisabled());
      editHandoutsButtons.forEach((button) => expect(button).toBeDisabled());
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
      expect(screen.getByText('Add new update')).toBeInTheDocument();
    });

    it('Edit handouts form is visible after clicking "Edit" button', async () => {
      render(<RootWrapper />);
      const editUpdateButtons = await screen.findAllByTestId('course-update-edit-button');
      const deleteButtons = await screen.findAllByTestId('course-update-delete-button');
      const editHandoutsButtons = await screen.findAllByTestId('course-handouts-edit-button');
      const editHandoutsButton = editHandoutsButtons[0];

      fireEvent.click(editHandoutsButton);

      expect(editHandoutsButton).toBeDisabled();
      expect(screen.getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeDisabled();
      editUpdateButtons.forEach((button) => expect(button).toBeDisabled());
      editHandoutsButtons.forEach((button) => expect(button).toBeDisabled());
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
      expect(screen.getByText('Edit handouts')).toBeInTheDocument();
    });

    it('Edit update form is visible after clicking "Edit" button', async () => {
      render(<RootWrapper />);
      let editUpdateButtons = await screen.findAllByTestId('course-update-edit-button');
      const editUpdateFirstButton = editUpdateButtons[0];
      fireEvent.click(editUpdateFirstButton);

      const deleteButtons = await screen.findAllByTestId('course-update-delete-button');
      const editHandoutsButtons = await screen.findAllByTestId('course-handouts-edit-button');
      editUpdateButtons = await screen.findAllByTestId('course-update-edit-button');

      expect(screen.getByText('Edit update')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeDisabled();
      editUpdateButtons.forEach((button) => expect(button).toBeDisabled());
      editHandoutsButtons.forEach((button) => expect(button).toBeDisabled());
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
      expect(screen.queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
    });
  });

  describe('page load failure API responses', () => {
    beforeEach(() => {
      const mocks = initializeMocks();

      store = mocks.reduxStore;
      axiosMock = mocks.axiosMock;
    });

    it('Course updates fetch should show updates loading error', async () => {
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(404);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(200, courseHandoutsMock);

      render(<RootWrapper />);

      const newButton = await screen.findByRole('button', { name: messages.newUpdateButton.defaultMessage });
      expect(screen.getByText(messages.loadingUpdatesErrorTitle.defaultMessage));
      expect(newButton).toBeDisabled();
      expect(screen.getByText(messages.noCourseUpdates.defaultMessage)).toBeVisible();
      expect(screen.queryByTestId('course-update')).toBeNull();
    });

    it('Course handouts fetch should show handouts loading error', async () => {
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(200, courseUpdatesMock);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(404);

      render(<RootWrapper />);

      await waitFor(() => {
        expect(screen.getByText(messages.loadingHandoutsErrorTitle.defaultMessage));
      });
      expect(screen.getByTestId('course-handouts-edit-button')).toBeDisabled();
    });

    it('displays an alert and sets status to DENIED when API responds with 403', async () => {
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(403, courseUpdatesMock);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(403);

      render(<RootWrapper />);

      await waitFor(() => {
        const { loadingStatuses } = store.getState().courseUpdates;
        Object.values(loadingStatuses)
          .some(status => expect(status).toEqual(RequestStatus.DENIED));
      });
      expect(screen.getByTestId('connectionErrorAlert')).toBeInTheDocument();
    });
  });

  describe('saving failure API responses', () => {
    beforeEach(() => {
      const mocks = initializeMocks();

      store = mocks.reduxStore;
      axiosMock = mocks.axiosMock;
      axiosMock
        .onGet(getCourseUpdatesApiUrl(courseId))
        .reply(200, courseUpdatesMock);
      axiosMock
        .onGet(getCourseHandoutApiUrl(courseId))
        .reply(200, courseHandoutsMock);
    });
    it('creating new update should show saving error alert', async () => {
      render(<RootWrapper />);

      const data = {
        content: '<p>Some text</p>',
        date: 'August 29, 2023',
      };

      axiosMock
        .onPost(getCourseUpdatesApiUrl(courseId), data)
        .reply(404);

      await executeThunk(createCourseUpdateQuery(courseId, data), store.dispatch);
      expect(screen.getByText(messages.savingNewUpdateErrorAlertDescription.defaultMessage)).toBeVisible();
      expect(screen.queryByText('Some text')).toBeNull();
      expect(screen.queryByText(data.date)).toBeNull();
    });

    it('editing course update should show saving error alert', async () => {
      render(<RootWrapper />);

      const data = {
        id: courseUpdatesMock[0].id,
        content: '<p>Some text</p>',
        date: 'August 29, 2023',
      };

      axiosMock
        .onPut(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(404);

      await executeThunk(editCourseUpdateQuery(courseId, data), store.dispatch);
      expect(screen.queryByText('Some text')).toBeNull();
      expect(screen.queryByText(data.date)).toBeNull();
      expect(screen.getByText(courseUpdatesMock[0].date)).toBeVisible();
      expect(screen.getByText(courseUpdatesMock[0].content)).toBeVisible();
      expect(screen.getByText(messages.savingUpdatesErrorDescription.defaultMessage)).toBeVisible();
    });

    it('deleting course update should show delete saving error alert', async () => {
      render(<RootWrapper />);

      axiosMock
        .onDelete(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(404);

      await executeThunk(deleteCourseUpdateQuery(courseId, courseUpdatesMock[0].id), store.dispatch);
      expect(screen.getByText(courseUpdatesMock[0].date)).toBeVisible();
      expect(screen.getByText(courseUpdatesMock[0].content)).toBeVisible();
      expect(screen.getByText(messages.deletingUpdatesErrorDescription.defaultMessage)).toBeVisible();
    });

    it('editing course handouts should show saving error alert', async () => {
      render(<RootWrapper />);

      const data = {
        ...courseHandoutsMock,
        data: '<p>Some handouts 1</p>',
      };

      axiosMock
        .onPut(getCourseHandoutApiUrl(courseId))
        .reply(404);

      await executeThunk(editCourseHandoutsQuery(courseId, data), store.dispatch);
      expect(screen.queryByText('Some handouts 1')).toBeNull();
      expect(screen.getByText(courseHandoutsMock.data)).toBeVisible();
      expect(await screen.findByText(messages.savingHandoutsErrorDescription.defaultMessage));
    });
  });
});
