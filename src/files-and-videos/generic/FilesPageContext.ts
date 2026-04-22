import React from 'react';

export interface FilePickerOptions {
  usageKey: string,
  multiSelect: boolean,
  fileTypes: string[] | null,
  embedded: boolean,
}

interface FilesPageContextInterface {
  filePickerMode: boolean,
  filePickerOptions?: FilePickerOptions,

}

export const FilesPageContext = React.createContext<FilesPageContextInterface>({
  filePickerMode: false,
});
