import { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Row } from '@tanstack/react-table';
import { useIntl } from '@edx/frontend-platform/i18n';

import TypeXToConfirmModal from '@src/generic/TypeXToConfirmModal';
import type { TreeRowData } from '@src/taxonomy/tree-table/types';
import messages from './messages';
import { getTagListRowData, getTagWithDescendantsCount } from './utils';

interface DeleteModalProps {
  isOpen: boolean;
  row: Row<TreeRowData> | null;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setRow: Dispatch<SetStateAction<Row<TreeRowData> | null>>;
  handleDeleteRow: (row: Row<TreeRowData>) => void | Promise<void>;
}

const DeleteModal = ({
  isOpen,
  row,
  setIsOpen,
  setRow,
  handleDeleteRow,
}: DeleteModalProps) => {
  const intl = useIntl();

  const handleConfirm = async (row: Row<TreeRowData>) => {
    await handleDeleteRow(row);
    setIsOpen(false);
    setRow(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setRow(null);
  };

  const rowData = row ? getTagListRowData(row) : null;
  const count = useMemo(() => (rowData ? getTagWithDescendantsCount(rowData) : 0), [rowData]);

  if (!row) {
    return null;
  }

  const hasSubtags = count > 1;
  const typeToDeleteText = hasSubtags
    ? intl.formatMessage(messages.typeToConfirmDeleteTagWithSubtags, { count })
    : intl.formatMessage(messages.typeToConfirmDeleteOneTag);
  const messageText = hasSubtags
    ? intl.formatMessage(messages.deleteTagWithSubtagsConfirmation, { count })
    : intl.formatMessage(messages.deleteTagConfirmation, { count });
  const parts = messageText.split(String(count));
  const bodyText = (
    <>
      <div>
        {parts[0]}
        <strong>{count}</strong>
        {parts[1]}
      </div>
      <div>
        <strong>{intl.formatMessage(messages.deleteTagConfirmationEmphasizedPart)}</strong>
      </div>
    </>
  );

  return (
    <TypeXToConfirmModal
      label={intl.formatMessage(messages.confirmDeleteTitle, { tagName: rowData?.value })}
      X={typeToDeleteText}
      bodyText={bodyText}
      confirmLabel={intl.formatMessage(count > 1 ? messages.deleteLabelPlural : messages.deleteLabelSingular)}
      cancelLabel={intl.formatMessage(messages.cancelLabel)}
      isOpen={isOpen}
      confirmPayload={row}
      setConfirmPayload={setRow}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

export default DeleteModal;
