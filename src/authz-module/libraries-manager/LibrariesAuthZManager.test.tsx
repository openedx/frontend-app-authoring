import { ReactElement } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import LibrariesAuthZManager from './LibrariesAuthZManager';
import { useLibraryAuthZ } from './context';

jest.mock('./context', () => {
  const actual = jest.requireActual('./context');
  return {
    ...actual,
    useLibraryAuthZ: jest.fn(),
    LibraryAuthZProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});
const mockedUseLibraryAuthZ = useLibraryAuthZ as jest.Mock;

jest.mock('./components/TeamTable', () => ({
  __esModule: true,
  default: () => <div data-testid="team-table">MockTeamTable</div>,
}));

const customRender = (
  ui: ReactElement,
) => render(
  <IntlProvider locale="en">
    {ui}
  </IntlProvider>,
);

describe('LibrariesAuthZManager', () => {
  beforeEach(() => {
    mockedUseLibraryAuthZ.mockReturnValue({
      libraryId: 'lib-001',
      libraryName: 'Mock Library',
      libraryOrg: 'MockOrg',
      username: 'mockuser',
      roles: ['admin'],
      permissions: [],
      canManageTeam: true,
    });
  });

  it('renders tabs and layout content correctly', () => {
    customRender(<LibrariesAuthZManager />);

    // Tabs
    expect(screen.getByRole('tab', { name: /Team Members/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Roles/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Permissions/i })).toBeInTheDocument();

    // Breadcrumb/page title
    expect(screen.getByText('Manage Access')).toBeInTheDocument(); // from intl.formatMessage
    expect(screen.getByText('lib-001')).toBeInTheDocument(); // subtitle

    // TeamTable is rendered
    expect(screen.getByTestId('team-table')).toBeInTheDocument();
  });
});
