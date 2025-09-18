import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { useLibrary, useValidateTeamMember } from './data/hooks';
import { LibraryAuthZProvider, useLibraryAuthZ } from './context';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('./data/hooks', () => ({
  useValidateTeamMember: jest.fn(),
  useLibrary: jest.fn(),
}));

// 🔧 Mock Test Component that consumes the context
const TestComponent = () => {
  const context = useLibraryAuthZ();
  return (
    <div>
      <div data-testid="username">{context.username}</div>
      <div data-testid="libraryId">{context.libraryId}</div>
      <div data-testid="canManageTeam">{context.canManageTeam ? 'true' : 'false'}</div>
      <div data-testid="libraryName">{context.libraryName}</div>
      <div data-testid="libraryOrg">{context.libraryOrg}</div>
    </div>
  );
};

describe('LibraryAuthZProvider', () => {
  const authenticatedUser = {
    username: 'testuser',
    email: 'testuser@example.com',
  };

  const mockAppContext = {
    authenticatedUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ libraryId: 'lib123' });

    (useValidateTeamMember as jest.Mock).mockReturnValue({
      data: {
        username: 'testuser',
        roles: ['admin'], // for canManageTeam: true
      },
    });

    (useLibrary as jest.Mock).mockReturnValue({
      data: {
        title: 'Test Library',
        org: 'Test Org',
      },
    });
  });

  it('provides the correct context values to consumers', () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <LibraryAuthZProvider>
          <TestComponent />
        </LibraryAuthZProvider>
      </AppContext.Provider>,
    );

    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    expect(screen.getByTestId('libraryId')).toHaveTextContent('lib123');
    expect(screen.getByTestId('canManageTeam')).toHaveTextContent('true');
    expect(screen.getByTestId('libraryName')).toHaveTextContent('Test Library');
    expect(screen.getByTestId('libraryOrg')).toHaveTextContent('Test Org');
  });

  it('throws error when libraryId is missing', () => {
    (useParams as jest.Mock).mockReturnValue({}); // No libraryId

    expect(() => {
      render(
        <AppContext.Provider value={mockAppContext}>
          <LibraryAuthZProvider>
            <TestComponent />
          </LibraryAuthZProvider>
        </AppContext.Provider>,
      );
    }).toThrow('MissingLibrary');
  });

  it('throws error when useLibraryAuthZ is used outside provider', () => {
    const BrokenComponent = () => {
      useLibraryAuthZ();
      return null;
    };

    expect(() => {
      render(<BrokenComponent />);
    }).toThrow('useLibraryAuthZ must be used within an LibraryAuthZProvider');
  });
});
