import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import {
  initializeMocks,
  render,
  waitFor,
  fireEvent,
  screen,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { useUserPermissions } from '@src/authz/data/apiHooks';

import * as apiHooks from '@src/data/apiHooks';
import {
  getCourseUpdatesApiUrl,
  getCourseHandoutApiUrl,
  updateCourseUpdatesApiUrl,
} from './data/api';
import { courseUpdatesMock, courseHandoutsMock } from './__mocks__';
import CourseUpdates from './CourseUpdates';
import messages from './messages';

let axiosMock;
const mockPathname = '/foo-bar';
const courseId = '123';

const mockMutationGets = (updates = courseUpdatesMock, handouts = courseHandoutsMock) => {
  axiosMock.resetHandlers();
  axiosMock.onGet(getCourseUpdatesApiUrl(courseId)).replyOnce(200, courseUpdatesMock);
  axiosMock.onGet(getCourseUpdatesApiUrl(courseId)).reply(200, updates);
  axiosMock.onGet(getCourseHandoutApiUrl(courseId)).replyOnce(200, courseHandoutsMock);
  axiosMock.onGet(getCourseHandoutApiUrl(courseId)).reply(200, handouts);
};

const setEditorValue = (value: string) => {
  fireEvent.change(screen.getByTestId('course-updates-wisiwyg-editor'), { target: { value } });
};

jest.mock('@src/authz/data/apiHooks', () => ({
  ...jest.requireActual('@src/authz/data/apiHooks'),
  useUserPermissions: jest.fn(() => ({
    isLoading: false,
    data: { canManageCourseUpdates: false, canViewCourseUpdates: true },
  })),
}));

jest.mock('@src/data/apiHooks', () => ({
  ...jest.requireActual('@src/data/apiHooks'),
  useWaffleFlags: jest.fn(() => ({ enableAuthzCourseAuthoring: false, isLoading: false })),
}));

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
  __esModule: true,
  default: ({ onChange, textValue }: {
    onChange: (value: string, editor: object) => void;
    textValue: string;
  }) => {
    const editor = {
      selection: { getBookmark: () => ({}), moveToBookmark: jest.fn() },
      getContent: () => textValue,
      setContent: jest.fn(),
    };
    return (
      <textarea
        data-testid="course-updates-wisiwyg-editor"
        defaultValue={textValue}
        onChange={(event) => onChange(event.target.value, editor)}
      />
    );
  },
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
      expect(await screen.findAllByTestId('course-update')).toHaveLength(3);
      expect(screen.getByTestId('course-handouts')).toBeInTheDocument();
    });

    it('should create course update', async () => {
      const data = { content: '<p>Some text</p>', date: 'August 29, 2023' };
      mockMutationGets([{ id: 4, ...data }]);
      axiosMock.onPost(getCourseUpdatesApiUrl(courseId)).reply(200, data);

      render(<RootWrapper />);
      await userEvent.click(await screen.findByRole('button', { name: messages.newUpdateButton.defaultMessage }));
      setEditorValue(data.content);
      await userEvent.click(screen.getByRole('button', { name: 'Post' }));

      expect(await screen.findByText('Some text')).toBeInTheDocument();
      expect(screen.getByText(data.date)).toBeInTheDocument();
    });

    it('should edit course update', async () => {
      const data = { ...courseUpdatesMock[0], content: '<p>Some text</p>', date: 'August 29, 2023' };
      mockMutationGets([data, ...courseUpdatesMock.slice(1)]);
      axiosMock.onPut(updateCourseUpdatesApiUrl(courseId, data.id)).reply(200, data);

      render(<RootWrapper />);
      await userEvent.click((await screen.findAllByTestId('course-update-edit-button'))[0]);
      setEditorValue(data.content);
      await userEvent.click(screen.getByRole('button', { name: 'Post' }));

      expect(await screen.findByText('Some text')).toBeInTheDocument();
      expect(screen.getByText(data.date)).toBeInTheDocument();
      expect(screen.queryByText(courseUpdatesMock[0].date)).not.toBeInTheDocument();
    });

    it('should delete course update', async () => {
      mockMutationGets(courseUpdatesMock.slice(1));
      axiosMock.onDelete(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id)).reply(200);

      render(<RootWrapper />);
      await userEvent.click((await screen.findAllByTestId('course-update-delete-button'))[0]);
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => expect(screen.queryByText(courseUpdatesMock[0].date)).not.toBeInTheDocument());
      expect(screen.queryByText(courseUpdatesMock[0].content)).not.toBeInTheDocument();
    });

    it('should edit course handouts', async () => {
      const data = { ...courseHandoutsMock, data: '<p>Some handouts 1</p>' };
      mockMutationGets(courseUpdatesMock, data);
      axiosMock.onPut(getCourseHandoutApiUrl(courseId)).reply(200, data);

      render(<RootWrapper />);
      await userEvent.click(await screen.findByTestId('course-handouts-edit-button'));
      setEditorValue(data.data);
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Some handouts 1')).toBeInTheDocument();
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
      expect(screen.getByDisplayValue(courseUpdatesMock[0].content)).toHaveValue(courseUpdatesMock[0].content);
    });
  });

  describe('page load failure API responses', () => {
    beforeEach(() => {
      const mocks = initializeMocks();

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
      expect(await screen.findByText(messages.loadingUpdatesErrorTitle.defaultMessage)).toBeInTheDocument();
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

      expect(await screen.findByText(messages.loadingHandoutsErrorTitle.defaultMessage)).toBeInTheDocument();
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

      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
  });

  describe('saving failure API responses', () => {
    beforeEach(() => {
      const mocks = initializeMocks();

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

      await userEvent.click(await screen.findByRole('button', { name: messages.newUpdateButton.defaultMessage }));
      setEditorValue(data.content);
      await userEvent.click(screen.getByRole('button', { name: 'Post' }));
      expect(await screen.findByText(messages.savingNewUpdateErrorAlertDescription.defaultMessage)).toBeVisible();
      expect(screen.queryByText('Some text')).toBeNull();
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

      await userEvent.click((await screen.findAllByTestId('course-update-edit-button'))[0]);
      setEditorValue(data.content);
      await userEvent.click(screen.getByRole('button', { name: 'Post' }));
      expect(await screen.findByText(messages.savingUpdatesErrorDescription.defaultMessage)).toBeVisible();
      expect(screen.getByText(courseUpdatesMock[0].date)).toBeVisible();
      expect(screen.getByText(courseUpdatesMock[0].content)).toBeVisible();
    });

    it('deleting course update should show delete saving error alert', async () => {
      render(<RootWrapper />);

      axiosMock
        .onDelete(updateCourseUpdatesApiUrl(courseId, courseUpdatesMock[0].id))
        .reply(404);

      await userEvent.click((await screen.findAllByTestId('course-update-delete-button'))[0]);
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(await screen.findByText(messages.deletingUpdatesErrorDescription.defaultMessage)).toBeVisible();
      expect(screen.getByText(courseUpdatesMock[0].date)).toBeVisible();
      expect(screen.getByText(courseUpdatesMock[0].content)).toBeVisible();
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

      await userEvent.click(await screen.findByTestId('course-handouts-edit-button'));
      setEditorValue(data.data);
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByText(messages.savingHandoutsErrorDescription.defaultMessage)).toBeInTheDocument();
      expect(await screen.findByText(courseHandoutsMock.data)).toBeVisible();
    });
  });

  describe('Authorization and permissions', () => {
    describe('when user has permission to manage course updates', () => {
      beforeEach(() => {
        const mocks = initializeMocks();
        axiosMock = mocks.axiosMock;

        (apiHooks.useWaffleFlags as jest.Mock).mockReturnValue({ enableAuthzCourseAuthoring: true, isLoading: false });
        (useUserPermissions as jest.Mock).mockReturnValue({
          isLoading: false,
          data: { canManageCourseUpdates: true, canViewCourseUpdates: true },
        });

        axiosMock
          .onGet(getCourseUpdatesApiUrl(courseId))
          .reply(200, courseUpdatesMock);
        axiosMock
          .onGet(getCourseHandoutApiUrl(courseId))
          .reply(200, courseHandoutsMock);
      });

      it('should render the "New update" button', async () => {
        render(<RootWrapper />);

        expect(
          await screen.findByRole('button', {
            name: messages.newUpdateButton.defaultMessage,
          }),
        ).toBeInTheDocument();
      });

      it('should render edit and delete buttons for course updates', async () => {
        const { container } = render(<RootWrapper />);
        await waitFor(() => {
          expect(container.querySelectorAll('.course-update')).toHaveLength(3);
        });

        expect(await screen.findAllByRole('button', { name: /edit/i })).toHaveLength(4); // 3 for course updates and 1 for handouts
        expect(await screen.findAllByRole('button', { name: /delete/i })).toHaveLength(3);
      });

      it('should open delete modal when clicking delete button on a course update', async () => {
        render(<RootWrapper />);

        const deleteButtons = await screen.findAllByTestId('course-update-delete-button');
        await userEvent.click(deleteButtons[0]);

        expect(screen.getByText('Are you sure you want to delete this update?')).toBeInTheDocument();
      });

      it('should render the "Add first update" button when there are no updates', async () => {
        axiosMock.resetHandlers();
        axiosMock.onGet(getCourseUpdatesApiUrl(courseId)).reply(200, []);
        axiosMock.onGet(getCourseHandoutApiUrl(courseId)).reply(200, courseHandoutsMock);

        render(<RootWrapper />);

        expect(
          await screen.findByRole('button', { name: messages.firstUpdateButton.defaultMessage }),
        ).toBeInTheDocument();
      });

      it('should NOT render the view-only alert', async () => {
        render(<RootWrapper />);

        expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
        expect(screen.queryByTestId('viewOnlyPermissionsAlert')).not.toBeInTheDocument();
      });
    });

    describe('when user does NOT have permission to manage course updates and enableAuthzCourseAuthoring is enabled', () => {
      beforeEach(() => {
        const mocks = initializeMocks();
        axiosMock = mocks.axiosMock;

        (apiHooks.useWaffleFlags as jest.Mock).mockReturnValue({ enableAuthzCourseAuthoring: true, isLoading: false });
        (useUserPermissions as jest.Mock).mockReturnValue({
          isLoading: false,
          data: { canManageCourseUpdates: false, canViewCourseUpdates: true },
        });

        axiosMock
          .onGet(getCourseUpdatesApiUrl(courseId))
          .reply(200, courseUpdatesMock);
        axiosMock
          .onGet(getCourseHandoutApiUrl(courseId))
          .reply(200, courseHandoutsMock);
      });

      it('should NOT render the "New update" button', async () => {
        render(<RootWrapper />);

        await waitFor(() => {
          expect(screen.getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
        });

        const newUpdateButton = screen.queryByRole('button', { name: /New update/ });

        expect(newUpdateButton).not.toBeInTheDocument();
      });

      it('should NOT render edit and delete buttons for course updates', async () => {
        const { container } = render(<RootWrapper />);

        await waitFor(() => {
          expect(container.querySelectorAll('.course-update')).toHaveLength(3);
          expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
        });
      });

      it('should NOT render the "Add first update" button when there are no updates', async () => {
        axiosMock.resetHandlers();
        axiosMock.onGet(getCourseUpdatesApiUrl(courseId)).reply(200, []);
        axiosMock.onGet(getCourseHandoutApiUrl(courseId)).reply(200, courseHandoutsMock);

        render(<RootWrapper />);

        expect(await screen.findByText(messages.noCourseUpdates.defaultMessage)).toBeVisible();
        expect(
          screen.queryByRole('button', { name: messages.firstUpdateButton.defaultMessage }),
        ).not.toBeInTheDocument();
      });

      it('should render the view-only alert', async () => {
        render(<RootWrapper />);

        expect(await screen.findByTestId('viewOnlyPermissionsAlert')).toBeInTheDocument();
        expect(screen.getByText(
          'You have view-only access to this page. Contact your organization admin to request editing permissions.',
        )).toBeInTheDocument();
      });
    });

    describe('when enableAuthzCourseAuthoring is disabled', () => {
      beforeEach(() => {
        const mocks = initializeMocks();
        axiosMock = mocks.axiosMock;

        (apiHooks.useWaffleFlags as jest.Mock).mockReturnValue({ enableAuthzCourseAuthoring: false, isLoading: false });
        (useUserPermissions as jest.Mock).mockReturnValue({
          isLoading: false,
          data: { canManageCourseUpdates: false },
        });

        axiosMock
          .onGet(getCourseUpdatesApiUrl(courseId))
          .reply(200, courseUpdatesMock);
        axiosMock
          .onGet(getCourseHandoutApiUrl(courseId))
          .reply(200, courseHandoutsMock);
      });

      it('should render the "New update" button (defaults to true when authz disabled)', async () => {
        render(<RootWrapper />);

        expect(
          await screen.findByRole('button', {
            name: messages.newUpdateButton.defaultMessage,
          }),
        ).toBeInTheDocument();
      });
    });

    describe('when permissions are still loading', () => {
      beforeEach(() => {
        const mocks = initializeMocks();
        axiosMock = mocks.axiosMock;

        (apiHooks.useWaffleFlags as jest.Mock).mockReturnValue({ enableAuthzCourseAuthoring: true, isLoading: false });
        (useUserPermissions as jest.Mock).mockReturnValue({
          isLoading: true,
          data: undefined,
        });

        axiosMock
          .onGet(getCourseUpdatesApiUrl(courseId))
          .reply(200, courseUpdatesMock);
        axiosMock
          .onGet(getCourseHandoutApiUrl(courseId))
          .reply(200, courseHandoutsMock);
      });

      it('should render loading spinner while permissions are loading', () => {
        render(<RootWrapper />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText(messages.headingTitle.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: messages.newUpdateButton.defaultMessage })).not.toBeInTheDocument();
      });
    });

    describe('when user does NOT have permission to view course updates', () => {
      beforeEach(() => {
        const mocks = initializeMocks();
        axiosMock = mocks.axiosMock;

        (apiHooks.useWaffleFlags as jest.Mock).mockReturnValue({ enableAuthzCourseAuthoring: true, isLoading: false });
        (useUserPermissions as jest.Mock).mockReturnValue({
          isLoading: false,
          data: { canManageCourseUpdates: false, canViewCourseUpdates: false },
        });

        axiosMock
          .onGet(getCourseUpdatesApiUrl(courseId))
          .reply(200, courseUpdatesMock);
        axiosMock
          .onGet(getCourseHandoutApiUrl(courseId))
          .reply(200, courseHandoutsMock);
      });

      it('should render PermissionDeniedAlert instead of course updates content', async () => {
        render(<RootWrapper />);

        expect(await screen.findByText(/You are not authorized to view this page/)).toBeInTheDocument();
        expect(screen.queryByText(messages.headingTitle.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.headingSubtitle.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {
          name: messages.newUpdateButton.defaultMessage,
        })).not.toBeInTheDocument();
      });
    });
  });
});
