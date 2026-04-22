import { useContext, useMemo } from 'react';
import { Row } from '@tanstack/react-table';
import { useIntl } from '@edx/frontend-platform/i18n';

import TypeXToConfirmModal from '@src/generic/TypeXToConfirmModal';
import { TreeTableContext } from '@src/taxonomy/tree-table';
import { TreeRowData } from '@src/taxonomy/tree-table/types';
import messages from './messages';
import { getTagListRowData, getTagWithDescendantsCount } from './utils';

const DeleteModal = () => {
  const {
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
    confirmDeleteDialogContext,
    setConfirmDeleteDialogContext,
    handleDeleteRow,
  } = useContext(TreeTableContext);
  const intl = useIntl();

  const handleConfirm = (row: Row<TreeRowData>) => {
    handleDeleteRow(row);
    setConfirmDeleteDialogOpen(false);
    setConfirmDeleteDialogContext(null);
  };

  const handleCancel = () => {
    setConfirmDeleteDialogOpen(false);
    setConfirmDeleteDialogContext(null);
  };

  const rowData = confirmDeleteDialogContext ? getTagListRowData(confirmDeleteDialogContext) : null;
  const count = useMemo(() => rowData ? getTagWithDescendantsCount(rowData) : 0, [confirmDeleteDialogContext]);

  const hasSubtags = count > 1;
  // const bodyText = hasSubtags ? intl.formatMessage(messages.deleteTagWithSubtagsConfirmation, { count }) : intl.formatMessage(messages.deleteTagConfirmation, { count });
  const typeToDeleteText = hasSubtags ? intl.formatMessage(messages.typeToConfirmDeleteTagWithSubtags, { count }) : intl.formatMessage(messages.typeToConfirmDeleteOneTag);
  const messageText = hasSubtags ? intl.formatMessage(messages.deleteTagWithSubtagsConfirmation, { count }) : intl.formatMessage(messages.deleteTagConfirmation, { count });
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
      isOpen={confirmDeleteDialogOpen}
      context={confirmDeleteDialogContext}
      setContext={setConfirmDeleteDialogContext}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

export default DeleteModal;
