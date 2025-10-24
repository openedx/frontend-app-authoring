import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import ReleaseNotes from './ReleaseNotes';
import messages from './messages';
import { mockReleaseNotes, mockState } from './__mocks__/mockData';
import { REQUEST_TYPES } from '../course-updates/constants';

// Mock getAuthenticatedUser
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Mock useReleaseNotes hook
const mockUseReleaseNotes = {
  requestType: null,
  notes: [],
  notesInitialValues: {},
  isFormOpen: false,
  isDeleteModalOpen: false,
  closeForm: jest.fn(),
  closeDeleteModal: jest.fn(),
  handleUpdatesSubmit: jest.fn(),
  handleOpenUpdateForm: jest.fn(),
  handleDeleteUpdateSubmit: jest.fn(),
  handleOpenDeleteForm: jest.fn(),
  errors: {},
};

jest.mock('./hooks', () => ({
  __esModule: true,
  useReleaseNotes: jest.fn(() => mockUseReleaseNotes),
}));

// Mock components
jest.mock('./sidebar/ReleaseNotesSidebar', () => ({
  __esModule: true,
  default: ({ notes }) => (
    <div data-testid="release-notes-sidebar">
      Sidebar with {notes?.length || 0} notes
    </div>
  ),
}));

jest.mock('./update-form/ReleaseNoteForm', () => ({
  __esModule: true,
  default: ({ initialValues, onSubmit, close }) => (
    <div data-testid="release-note-form">
      <h3>Release Note Form</h3>
      <button type="button" onClick={() => onSubmit(initialValues)}>Submit</button>
      <button type="button" onClick={close}>Cancel</button>
    </div>
  ),
}));

jest.mock('./delete-modal/DeleteModal', () => ({
  __esModule: true,
  default: ({
    isOpen, close, onDeleteSubmit, errorDeleting,
  }) => (
    isOpen ? (
      <div data-testid="delete-modal">
        <h3>Delete Modal</h3>
        <button type="button" onClick={onDeleteSubmit}>Delete</button>
        <button type="button" onClick={close}>Cancel</button>
        {errorDeleting && <span>Delete Error</span>}
      </div>
    ) : null
  ),
}));

// Mock other dependencies
jest.mock('../header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../generic/sub-header/SubHeader', () => ({
  __esModule: true,
  default: ({ title, headerActions }) => (
    <div data-testid="sub-header">
      <h1>{title}</h1>
      {headerActions}
    </div>
  ),
}));

jest.mock('@edx/frontend-component-footer', () => ({
  StudioFooterSlot: () => <div data-testid="footer">Footer</div>,
}));

const reducer = (state = mockState) => state;
const makeStore = () => createStore(reducer, mockState);

const { useReleaseNotes } = require('./hooks');

describe('ReleaseNotes', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = makeStore();
    useReleaseNotes.mockReturnValue(mockUseReleaseNotes);
    getAuthenticatedUser.mockReturnValue({ administrator: false });
  });

  const renderReleaseNotes = () => render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <ReleaseNotes />
      </IntlProvider>
    </Provider>,
  );

  describe('Rendering', () => {
    test('renders page title', () => {
      renderReleaseNotes();
      expect(screen.getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    });

    test('renders header and footer', () => {
      renderReleaseNotes();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    test('does not render New Post button for non-admin users', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: false });
      renderReleaseNotes();
      expect(screen.queryByRole('button', { name: messages.newPostButton.defaultMessage })).not.toBeInTheDocument();
    });

    test('renders New Post button for admin users', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      renderReleaseNotes();
      expect(screen.getByRole('button', { name: messages.newPostButton.defaultMessage })).toBeInTheDocument();
    });

    test('renders sidebar with release notes when notes exist', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: mockReleaseNotes,
      });
      renderReleaseNotes();
      expect(screen.getByTestId('release-notes-sidebar')).toBeInTheDocument();
    });

    test('renders empty state when no notes', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [],
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.noReleaseNotes.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('Release Notes Display', () => {
    test('displays release note title and description', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
      });
      renderReleaseNotes();
      expect(screen.getByText(mockReleaseNotes[0].title)).toBeInTheDocument();
    });

    test('displays edit button for admin users', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
      });
      renderReleaseNotes();
      expect(screen.getByTestId('release-note-edit-button')).toBeInTheDocument();
    });

    test('displays delete button for admin users', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
      });
      renderReleaseNotes();
      expect(screen.getByTestId('release-note-delete-button')).toBeInTheDocument();
    });

    test('does not display edit/delete buttons for non-admin users', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: false });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
      });
      renderReleaseNotes();
      expect(screen.queryByTestId('release-note-edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('release-note-delete-button')).not.toBeInTheDocument();
    });

    test('displays scheduled label for future notes', () => {
      const futureNote = {
        ...mockReleaseNotes[0],
        published_at: new Date(Date.now() + 86400000).toISOString(), // +1 day
      };
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [futureNote],
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.scheduledLabel.defaultMessage)).toBeInTheDocument();
    });

    test('displays created_by email if present', () => {
      const noteWithCreator = {
        ...mockReleaseNotes[0],
        created_by: 'test@example.com',
      };
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [noteWithCreator],
      });
      renderReleaseNotes();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    test('displays multiple notes grouped by date', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: mockReleaseNotes,
      });
      renderReleaseNotes();
      mockReleaseNotes.forEach((note) => {
        expect(screen.getByText(note.title)).toBeInTheDocument();
      });
    });

    test('displays unscheduled label for notes without published_at', () => {
      const unscheduledNote = {
        ...mockReleaseNotes[0],
        published_at: null,
      };
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [unscheduledNote],
      });
      renderReleaseNotes();
      expect(screen.getByText(/unscheduled/i)).toBeInTheDocument();
    });
  });

  describe('Form Modal', () => {
    test('does not show form modal initially', () => {
      renderReleaseNotes();
      expect(screen.queryByTestId('release-note-form')).not.toBeInTheDocument();
    });

    test('opens form modal when New Post is clicked', () => {
      const handleOpenUpdateForm = jest.fn();
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        handleOpenUpdateForm,
      });
      renderReleaseNotes();

      fireEvent.click(screen.getByRole('button', { name: messages.newPostButton.defaultMessage }));

      expect(handleOpenUpdateForm).toHaveBeenCalledWith(REQUEST_TYPES.add_new_update);
    });

    test('displays form modal when isFormOpen is true', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
      });
      renderReleaseNotes();
      expect(screen.getByTestId('release-note-form')).toBeInTheDocument();
    });

    test('displays new post title in modal when adding', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        requestType: REQUEST_TYPES.add_new_update,
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.newPostButton.defaultMessage)).toBeInTheDocument();
    });

    test('displays edit title in modal when editing', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        requestType: REQUEST_TYPES.edit_update,
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.editButton.defaultMessage)).toBeInTheDocument();
    });

    test('closes form modal when close is called', () => {
      const closeForm = jest.fn();
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        closeForm,
      });
      renderReleaseNotes();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(closeForm).toHaveBeenCalled();
    });

    test('passes initial values to form', () => {
      const notesInitialValues = {
        id: 1,
        title: 'Test',
        description: '<p>Test</p>',
        published_at: new Date(),
      };
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        notesInitialValues,
      });
      renderReleaseNotes();
      expect(screen.getByTestId('release-note-form')).toBeInTheDocument();
    });

    test('displays error alert when savingNote error exists', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        errors: { savingNote: true },
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.errorSavingPost.defaultMessage)).toBeInTheDocument();
    });

    test('displays error alert when creatingNote error exists', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        errors: { creatingNote: true },
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.errorSavingPost.defaultMessage)).toBeInTheDocument();
    });

    test('edit and delete buttons are disabled when form is open', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
        isFormOpen: true,
      });
      renderReleaseNotes();

      expect(screen.getByTestId('release-note-edit-button')).toBeDisabled();
      expect(screen.getByTestId('release-note-delete-button')).toBeDisabled();
    });
  });

  describe('Edit and Delete Actions', () => {
    test('opens edit form when edit button is clicked', () => {
      const handleOpenUpdateForm = jest.fn();
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
        handleOpenUpdateForm,
      });
      renderReleaseNotes();

      fireEvent.click(screen.getByTestId('release-note-edit-button'));

      expect(handleOpenUpdateForm).toHaveBeenCalledWith(REQUEST_TYPES.edit_update, mockReleaseNotes[0]);
    });

    test('opens delete modal when delete button is clicked', () => {
      const handleOpenDeleteForm = jest.fn();
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
        handleOpenDeleteForm,
      });
      renderReleaseNotes();

      fireEvent.click(screen.getByTestId('release-note-delete-button'));

      expect(handleOpenDeleteForm).toHaveBeenCalledWith(mockReleaseNotes[0]);
    });

    test('displays delete modal when isDeleteModalOpen is true', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isDeleteModalOpen: true,
      });
      renderReleaseNotes();
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    test('calls handleDeleteUpdateSubmit when delete is confirmed', () => {
      const handleDeleteUpdateSubmit = jest.fn();
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isDeleteModalOpen: true,
        handleDeleteUpdateSubmit,
      });
      renderReleaseNotes();

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      expect(handleDeleteUpdateSubmit).toHaveBeenCalled();
    });

    test('displays error in delete modal when deletingNote error exists', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isDeleteModalOpen: true,
        errors: { deletingNote: true },
      });
      renderReleaseNotes();
      expect(screen.getByText('Delete Error')).toBeInTheDocument();
    });

    test('closes delete modal when cancel is clicked', () => {
      const closeDeleteModal = jest.fn();
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isDeleteModalOpen: true,
        closeDeleteModal,
      });
      renderReleaseNotes();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(closeDeleteModal).toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    test('displays error message when loadingNotes error is present', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        errors: { loadingNotes: true },
      });
      renderReleaseNotes();
      expect(screen.getByText(messages.errorLoadingPage.defaultMessage)).toBeInTheDocument();
    });

    test('hides content when loadingNotes error is present', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [mockReleaseNotes[0]],
        errors: { loadingNotes: true },
      });
      renderReleaseNotes();
      expect(screen.queryByTestId('release-notes-sidebar')).not.toBeInTheDocument();
    });

    test('does not show New Post button when loadingNotes error exists', () => {
      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        errors: { loadingNotes: true },
      });
      renderReleaseNotes();
      expect(screen.queryByRole('button', { name: messages.newPostButton.defaultMessage })).not.toBeInTheDocument();
    });
  });

  describe('BeforeUnload Handler', () => {
    test('sets up beforeunload listener when form is open', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
      });

      renderReleaseNotes();

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    test('removes beforeunload listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
      });

      const { unmount } = renderReleaseNotes();
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    test('calls preventDefault when form is open', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
      });

      renderReleaseNotes();

      const beforeUnloadEvent = new Event('beforeunload');
      const preventDefaultSpy = jest.spyOn(beforeUnloadEvent, 'preventDefault');

      window.dispatchEvent(beforeUnloadEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();

      preventDefaultSpy.mockRestore();
    });

    test('does not call preventDefault when form is closed', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: false,
      });

      renderReleaseNotes();

      const beforeUnloadEvent = new Event('beforeunload');
      const preventDefaultSpy = jest.spyOn(beforeUnloadEvent, 'preventDefault');

      window.dispatchEvent(beforeUnloadEvent);

      // Should not prevent default when form is not open
      preventDefaultSpy.mockRestore();
    });
  });

  describe('Timezone Display', () => {
    test('displays timezone abbreviation in scheduled tooltip', () => {
      const futureDate = new Date(Date.now() + 86400000); // +1 day
      const futureNote = {
        ...mockReleaseNotes[0],
        published_at: futureDate.toISOString(),
      };

      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [futureNote],
      });

      renderReleaseNotes();

      const scheduledButton = screen.getByRole('button', { name: new RegExp(messages.scheduledLabel.defaultMessage) });
      expect(scheduledButton).toBeInTheDocument();
    });

    test('displays scheduled label for future dated note', () => {
      const futureDate = new Date(Date.now() + 86400000);
      const futureNote = {
        ...mockReleaseNotes[0],
        published_at: futureDate.toISOString(),
      };

      getAuthenticatedUser.mockReturnValue({ administrator: true });
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        notes: [futureNote],
      });

      renderReleaseNotes();

      // Should display scheduled label (not checking exact timezone formatting)
      const scheduledButton = screen.getByRole('button', { name: new RegExp(messages.scheduledLabel.defaultMessage) });
      expect(scheduledButton).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('passes correct props to ReleaseNoteForm when form is open', () => {
      const handleUpdatesSubmit = jest.fn();
      const closeForm = jest.fn();
      const notesInitialValues = {
        id: null,
        title: '',
        description: '',
        published_at: new Date(),
      };

      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        requestType: REQUEST_TYPES.add_new_update,
        notesInitialValues,
        handleUpdatesSubmit,
        closeForm,
      });

      renderReleaseNotes();

      // Form should be rendered
      expect(screen.getByTestId('release-note-form')).toBeInTheDocument();
    });

    test('passes handleUpdatesSubmit callback to form', () => {
      const handleUpdatesSubmit = jest.fn();
      const notesInitialValues = {
        id: null,
        title: '',
        description: '',
        published_at: new Date(),
      };

      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        handleUpdatesSubmit,
        notesInitialValues,
      });

      renderReleaseNotes();

      const form = screen.getByTestId('release-note-form');
      expect(form).toBeInTheDocument();
    });

    test('passes closeForm callback to modal', () => {
      const closeForm = jest.fn();

      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
        closeForm,
      });

      renderReleaseNotes();

      // Form modal should be open
      expect(screen.getByTestId('release-note-form')).toBeInTheDocument();
    });
  });

  describe('beforeunload Event Handler', () => {
    test('prevents unload when form is open', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: true,
      });

      renderReleaseNotes();

      // Trigger beforeunload event
      window.dispatchEvent(new Event('beforeunload'));

      expect(screen.getByTestId('release-note-form')).toBeInTheDocument();
    });

    test('allows unload when form is closed', () => {
      useReleaseNotes.mockReturnValue({
        ...mockUseReleaseNotes,
        isFormOpen: false,
      });

      renderReleaseNotes();

      // Form should not be rendered
      expect(screen.queryByTestId('release-note-form')).not.toBeInTheDocument();
    });
  });
});
