import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { filePickerSubmitFiles } from '@src/files-and-videos/generic/table-components/utils';
import messages from '@src/files-and-videos/generic/messages';
import React from 'react';

interface FilePickerColumnProps {
  row: {
    original: Record<string, any>;
  };
}

export const FilePickerColumn = ({ row }: FilePickerColumnProps) => {
  const intl = useIntl();
  return (
    <Button
      variant="link"
      onClick={async () => {
        await filePickerSubmitFiles([row.original]);
      }}
    >
      {intl.formatMessage(messages.fileSelectButton)}
    </Button>
  );
};
