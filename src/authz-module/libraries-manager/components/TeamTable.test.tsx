import { ReactElement } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import TeamTable from './TeamTable';
import { useTeamMembers } from '../data/hooks';
import { useLibraryAuthZ } from '../context';

jest.mock('../data/hooks', () => ({
  useTeamMembers: jest.fn(),
}));

jest.mock('../context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

const customRender = (
  ui: ReactElement,
) => render(
  <IntlProvider locale="en">
    {ui}
  </IntlProvider>,
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

  it('renders Edit button only for users with than can manage team members (current user can not edit themselves)', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    customRender(<TeamTable />);

    // Should not find Edit button for current user
    expect(screen.queryAllByText('Edit')).toHaveLength(1);
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
