import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import { mockContentLibrary, mockGetLibraryTeam } from '../data/api.mocks';
import {
  getContentLibraryApiUrl,
  getLibraryTeamApiUrl,
  getLibraryTeamMemberApiUrl,
} from '../data/api';
import { LibraryProvider } from '../common/context/LibraryContext';
import { ToastProvider } from '../../generic/toast-context';
import LibraryTeam from './LibraryTeam';

mockContentLibrary.applyMock();
mockGetLibraryTeam.applyMock();

describe('<LibraryTeam />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  const { libraryId } = mockContentLibrary;
  const renderLibraryTeam = async () => {
    render(
      <ToastProvider>
        <LibraryProvider libraryId={libraryId}>
          <LibraryTeam />
        </LibraryProvider>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByRole('switch', { name: /Allow public read/i })).toBeInTheDocument();
    });

    expect(screen.getByText(mockGetLibraryTeam.adminMember.username)).toBeInTheDocument();
    expect(screen.getByText(mockGetLibraryTeam.adminMember.email)).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    expect(screen.getByText(mockGetLibraryTeam.authorMember.username)).toBeInTheDocument();
    expect(screen.getByText(mockGetLibraryTeam.authorMember.email)).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();

    expect(screen.getByText(mockGetLibraryTeam.readerMember.username)).toBeInTheDocument();
    expect(screen.getByText(mockGetLibraryTeam.readerMember.email)).toBeInTheDocument();
    expect(screen.getByText('Read Only')).toBeInTheDocument();
  };

  it('shows a spinner while loading the Library Team data', async () => {
    render(
      <LibraryProvider libraryId={mockContentLibrary.libraryIdThatNeverLoads}>
        <LibraryTeam />
      </LibraryProvider>,
    );

    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows the library team in read-only mode to non-Admin, non-Staff users', async () => {
    // Authenticate as a non-Staff user who is not on the library team
    initializeMockApp({
      authenticatedUser: {
        administrator: false,
        roles: [],
        ...mockGetLibraryTeam.notMember,
      },
    });
    await renderLibraryTeam();

    // Current user is not a global admin or a Library Team Admin, so all edit buttons should be absent
    expect(screen.queryByText('You!')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /Allow public read/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Make Admin' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Make Author' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Make Reader' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New team member' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete team member' })).not.toBeInTheDocument();
  });

  test.each([
    {
      label: 'Library Team Admin',
      user: {
        administrator: false,
        roles: [],
        ...mockGetLibraryTeam.adminMember,
      },
      expectYou: true,
    },
    {
      label: 'Global Staff',
      user: {
        administrator: true,
        roles: [],
        ...mockGetLibraryTeam.notMember,
      },
      expectYou: false,
    },
  ])(
    'allows $label users to edit library team members',
    async ({ user: authenticatedUser, expectYou }) => {
      initializeMockApp({ authenticatedUser });
      await renderLibraryTeam();

      const youLabel = screen.queryByText('You!');
      if (expectYou) {
        expect(youLabel).toBeInTheDocument();
      } else {
        expect(youLabel).not.toBeInTheDocument();
      }

      // Single Admin user cannot be demoted or deleted.
      expect(screen.getByText('Promote another member to Admin to change this user\'s access rights.')).toBeInTheDocument();

      // Author + Reader can be made Admin
      expect(screen.getAllByRole('button', { name: 'Make Admin' }).length).toBe(2);
      // Reader can be made Author
      expect(screen.getByRole('button', { name: 'Make Author' })).toBeInTheDocument();
      // Author can be made Reader
      expect(screen.getByRole('button', { name: 'Make Reader' })).toBeInTheDocument();
      // Author + Reader can be deleted
      expect(screen.getAllByRole('button', { name: 'Delete team member' }).length).toBe(2);
    },
  );

  it('allows library to be made "public read"', async () => {
    const url = getContentLibraryApiUrl(libraryId);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPatch(url).reply(204);

    await renderLibraryTeam();
    const checkbox = screen.getByRole('switch', { name: /Allow public read/i });
    userEvent.click(checkbox);

    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(1);
      expect(axiosMock.history.patch[0].data).toBe(
        '{"allow_public_read":true}',
      );
    });
  });

  it('allows new library team members to be added', async () => {
    const url = getLibraryTeamApiUrl(libraryId);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPost(url).reply(204, {});

    await renderLibraryTeam();

    let addButton = screen.getByRole('button', { name: 'New team member' });
    userEvent.click(addButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    userEvent.click(cancelButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(0);
    });

    addButton = screen.getByRole('button', { name: 'New team member' });
    userEvent.click(addButton);
    const emailInput = screen.getByRole('textbox', { name: 'User\'s email address' });
    userEvent.click(emailInput);
    userEvent.type(emailInput, 'another@user.tld');

    const saveButton = screen.getByRole('button', { name: /add member/i });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].data).toBe(
        `{"library_id":"${libraryId}","email":"another@user.tld","access_level":"read"}`,
      );
    });

    expect(await screen.findByText('Team Member added')).toBeInTheDocument();
  });

  it('shows error when specific error (string)', async () => {
    const url = getLibraryTeamApiUrl(libraryId);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPost(url).reply(400, { email: 'This is a specific error.' });

    await renderLibraryTeam();

    const addButton = screen.getByRole('button', { name: 'New team member' });
    userEvent.click(addButton);
    const emailInput = screen.getByRole('textbox', { name: 'User\'s email address' });
    userEvent.click(emailInput);
    userEvent.type(emailInput, 'another@user.tld');

    const saveButton = screen.getByRole('button', { name: /add member/i });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });

    expect(await screen.findByText(
      'Error adding Team Member. This is a specific error.',
    )).toBeInTheDocument();
  });

  it('shows error when specific error (Array)', async () => {
    const url = getLibraryTeamApiUrl(libraryId);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPost(url).reply(400, { email: ['This is a specific error.'] });

    await renderLibraryTeam();

    const addButton = screen.getByRole('button', { name: 'New team member' });
    userEvent.click(addButton);
    const emailInput = screen.getByRole('textbox', { name: 'User\'s email address' });
    userEvent.click(emailInput);
    userEvent.type(emailInput, 'another@user.tld');

    const saveButton = screen.getByRole('button', { name: /add member/i });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });

    expect(await screen.findByText(
      'Error adding Team Member. This is a specific error.',
    )).toBeInTheDocument();
  });

  it('shows error', async () => {
    const url = getLibraryTeamApiUrl(libraryId);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPost(url).reply(400, {});

    await renderLibraryTeam();

    const addButton = screen.getByRole('button', { name: 'New team member' });
    userEvent.click(addButton);
    const emailInput = screen.getByRole('textbox', { name: 'User\'s email address' });
    userEvent.click(emailInput);
    userEvent.type(emailInput, 'another@user.tld');

    const saveButton = screen.getByRole('button', { name: /add member/i });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });

    expect(await screen.findByText('Error adding Team Member')).toBeInTheDocument();
  });

  it('allows library team member roles to be changed', async () => {
    const { username } = mockGetLibraryTeam.readerMember;
    const url = getLibraryTeamMemberApiUrl(libraryId, username);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPut(url).reply(204, {});

    await renderLibraryTeam();

    const makeAuthor = screen.getByRole('button', { name: 'Make Author' });
    userEvent.click(makeAuthor);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toEqual(1);
      expect(axiosMock.history.put[0].data).toBe(
        `{"library_id":"${libraryId}","username":"${username}","access_level":"author"}`,
      );
    });
  });

  it('allows library team members to be deleted', async () => {
    const { username } = mockGetLibraryTeam.authorMember;
    const url = getLibraryTeamMemberApiUrl(libraryId, username);
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onDelete(url).reply(204, {});

    await renderLibraryTeam();

    const deleteMember = screen.getAllByRole('button', { name: 'Delete team member' })[0];
    userEvent.click(deleteMember);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
    });
  });
});
