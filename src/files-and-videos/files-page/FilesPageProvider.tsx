import React, { useMemo } from 'react';

export interface FilePickerOptions {
  usageKey: string;
  multiSelect: boolean;
  mimeType: string | null;
}

interface FilesPageContextInterface {
  filePickerMode: boolean;
  filePickerOptions?: FilePickerOptions;
}

export const FilesPageContext = React.createContext<FilesPageContextInterface>({
  filePickerMode: false,
});

interface FilesPageProviderProps extends FilesPageContextInterface {
  children: React.ReactNode;
}

const FilesPageProvider = ({
  children,
  filePickerMode = false,
  filePickerOptions,
}: FilesPageProviderProps) => {
  const contextValue = useMemo(() => ({
    filePickerMode,
    filePickerOptions,
  }), []);
  return (
    <FilesPageContext.Provider
      value={contextValue}
    >
      {children}
    </FilesPageContext.Provider>
  );
};

export default FilesPageProvider;
