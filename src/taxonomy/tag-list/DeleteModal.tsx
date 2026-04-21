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
    handleDeleteTag,
  } = useContext(TreeTableContext);
  const intl = useIntl();

  const handleConfirm = (row: Row<TreeRowData>) => {
    handleDeleteTag(row);
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
  const bodyText = hasSubtags ? intl.formatMessage(messages.deleteTagWithSubtagsConfirmation, { count }) : intl.formatMessage(messages.deleteTagConfirmation);
  const typeToDeleteText = hasSubtags ? intl.formatMessage(messages.typeToConfirmDeleteTagWithSubtags) : intl.formatMessage(messages.typeToConfirmDeleteOneTag);

  return (
    <TypeXToConfirmModal
      label={intl.formatMessage(messages.confirmDeleteTitle, { tagName: rowData?.value })}
      X={typeToDeleteText}
      bodyText={bodyText}
      confirmLabel={intl.formatMessage(messages.deleteLabel)}
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
