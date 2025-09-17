import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MODULE_PATH } from '@src/authz-module/constants';
import TeamTable from './TeamTable';
import { useTeamMembers } from '../data/hooks';
import { useLibraryAuthZ } from '../context';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../data/hooks', () => ({
  useTeamMembers: jest.fn(),
}));

jest.mock('../context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

const customRender = (
  ui: ReactElement,
) => render(
  <BrowserRouter>
    <IntlProvider locale="en">
      {ui}
    </IntlProvider>
  </BrowserRouter>,
);

describe('TeamTable', () => {
  const mockTeamMembers = [
    {
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
      roles: ['Admin', 'Editor'],
      username: 'alice',
    },
    {
      id: '2',
      name: 'Bob',
      email: 'bob@example.com',
      roles: ['Viewer'],
      username: 'bob',
    },
  ];

  const mockAuthZ = {
    libraryId: 'lib:123',
    canManageTeam: true,
    username: 'alice',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeletons while loading', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    customRender(<TeamTable />);

    const skeletons = screen.getAllByText('', { selector: '[aria-busy="true"]' });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders team member data after loading', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    customRender(<TeamTable />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders Edit button only for users with than can manage team members (current user can not edit themselves)', async () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    customRender(<TeamTable />);

    const editButtons = screen.queryAllByText('Edit');
    // Should not find Edit button for current user
    expect(editButtons).toHaveLength(1);

    await userEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/console/authz/${MODULE_PATH.replace(':libraryId', 'lib:123')}`,
    );
  });

  it('does not render Edit button if canManageTeam is false', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue({
      ...mockAuthZ,
      canManageTeam: false,
    });

    customRender(<TeamTable />);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('does not render Edit button while loading', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    customRender(<TeamTable />);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});
