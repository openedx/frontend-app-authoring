import React, {
  createContext, useContext, useMemo, ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { useLibrary, useValidateTeamMember } from './data/hooks';

export type AppContextType = {
  authenticatedUser: {
    username: string;
    email: string;
  };
};

type LibraryAuthZContextType = {
  canManageTeam: boolean;
  libraryId: string;
  roles: string[];
  permissions: string[];
  libraryName: string;
  libraryOrg: string;
};

const LibraryAuthZContext = createContext<LibraryAuthZContextType | undefined>(undefined);

type AuthZProviderProps = {
  children: ReactNode;
};

export const LibraryAuthZProvider: React.FC<AuthZProviderProps> = ({ children }) => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const { authenticatedUser } = useContext(AppContext) as AppContextType;

  if (!libraryId) {
    throw new Error('MissingLibrary');
  }
  const { data: currentUser } = useValidateTeamMember(libraryId, authenticatedUser.username);

  const { data: libraryMetadata } = useLibrary(libraryId);

  const value = useMemo((): LibraryAuthZContextType => ({
    libraryId,
    libraryName: libraryMetadata.title,
    libraryOrg: libraryMetadata.org,
    roles: [],
    permissions: [],
    canManageTeam: currentUser.roles.includes('admin'),
  }), [libraryId, authenticatedUser]);

  return (
    <LibraryAuthZContext.Provider value={value}>
      {children}
    </LibraryAuthZContext.Provider>
  );
};

export const useLibraryAuthZ = (): LibraryAuthZContextType => {
  const context = useContext(LibraryAuthZContext);
  if (context === undefined) {
    throw new Error('useLibraryAuthZ must be used within an LibraryAuthZProvider');
  }
  return context;
};
