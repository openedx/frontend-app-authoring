import { Button } from '@openedx/paragon';
import { filePickerSubmitFile } from '@src/files-and-videos/generic/table-components/utils';
import React from 'react';

interface FilePickerColumnProps {
  row: {
    original: Record<string, any>;
  }
}

export const FilePickerColumn = ({ row }:FilePickerColumnProps) => (
  <Button
    variant="link"
    onClick={async () => {
      await filePickerSubmitFile([row.original]);
    }}
  >
    Select
  </Button>
);
