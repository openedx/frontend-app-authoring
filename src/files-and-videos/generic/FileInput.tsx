import React, { ChangeEvent, ChangeEventHandler, MutableRefObject } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getSupportedFormats } from '../videos-page/data/utils';
import messages from './messages';

declare interface UseFileInputArgs {
  onAddFile: (files: File[]) => void,
  setSelectedRows: (files: File[]) => void,
  setAddOpen: () => void,
}

declare interface FileInputVars {
  click: () => void,
  addFile: ChangeEventHandler<HTMLInputElement>,
  ref: MutableRefObject<HTMLInputElement | null>
}

export const useFileInput = ({
  onAddFile,
  setSelectedRows,
  setAddOpen,
}: UseFileInputArgs): FileInputVars => {
  const ref = React.useRef<HTMLInputElement>(null);
  const click = () => ref.current?.click();
  const addFile = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    setSelectedRows([...files!]);
    onAddFile(Object.values(files!));
    setAddOpen();
    e.target.value = '';
  };
  return {
    click,
    addFile,
    ref,
  };
};

declare interface FileInputArgs {
  fileInput: {
    addFile: ChangeEventHandler<HTMLInputElement>,
    ref: MutableRefObject<HTMLInputElement | null>,
  },
  supportedFileFormats?: string | string[] | Record<string, string[]>,
  allowMultiple?: boolean,
  id?: string,
}

const FileInput = ({
  fileInput: hook, supportedFileFormats, allowMultiple = true, id,
}: FileInputArgs) => {
  const intl = useIntl();
  return (
    <input
      id={id}
      accept={getSupportedFormats(supportedFileFormats)}
      aria-label={intl.formatMessage(messages.fileInputAriaLabel)}
      className="upload d-none"
      onChange={hook.addFile}
      ref={hook.ref}
      type="file"
      multiple={allowMultiple}
    />
  );
};

export default FileInput;
