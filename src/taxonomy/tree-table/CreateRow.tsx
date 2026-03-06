import React, { useState } from 'react';
import { Button, Spinner } from '@openedx/paragon';

import { EditableCell } from './EditableCell';
import type { CreateRowMutationState, TreeColumnDef } from './types';

interface CreateRowProps {
  draftError: string;
  setDraftError: (error: string) => void;
  handleCreateRow: (value: string) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  createRowMutation: CreateRowMutationState;
  columns: TreeColumnDef[];
}

const CreateRow: React.FC<CreateRowProps> = ({
  draftError,
  setDraftError,
  handleCreateRow,
  setIsCreatingTopRow,
  exitDraftWithoutSave,
  createRowMutation,
  columns,
}) => {
  const [newRowValue, setNewRowValue] = useState('');

  return (

    <tr id="creating-top-row" data-testid="creating-top-row">
      <td colSpan={1} style={{ padding: '8px 8px 8px 0' }}>
        <EditableCell
          errorMessage={draftError}
          isSaving={createRowMutation.isPending}
          onChange={(e) => {
            setNewRowValue(e.target.value);
          }}
        />
      </td>
      <td colSpan={columns.length - 1} style={{
        width: '150px',
        minWidth: '20px',
        maxWidth: '9.0072e+15px',
        padding: '8px',
        verticalAlign: 'top',
        overflowWrap: 'anywhere',
      }}>
        <span className="d-flex justify-content-end">
          <span className="mr-2">
            <Button variant="secondary" size="sm" onClick={() => {
              setDraftError('');
              setNewRowValue('');
              setIsCreatingTopRow(false);
              exitDraftWithoutSave();
            }}>
              Cancel
            </Button>
          </span>
          <span className="mr-2">
            <Button variant="primary" size="sm" onClick={() => handleCreateRow(newRowValue)}>
              Save
            </Button>
          </span>
          {createRowMutation.isPending && (
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              size="sm"
              screenReaderText="Saving..."
            />
          )}
        </span>
      </td>
    </tr>
  );
};

export { CreateRow };
