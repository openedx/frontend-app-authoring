import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import { useOptionalLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useCollection, useUpdateCollection } from '../data/apiHooks';
import messages from './messages';

const CollectionInfoHeader = () => {
  const intl = useIntl();

  const { libraryId, readOnly } = useOptionalLibraryContext();
  const { sidebarItemInfo } = useSidebarContext();

  const collectionId = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  const { data: collection } = useCollection(libraryId, collectionId);

  const updateMutation = useUpdateCollection();
  const { showToast } = useContext(ToastContext);

  const handleSaveTitle = async (newTitle: string) => {
    if (!libraryId) {
      return;
    }
    try {
      await updateMutation.mutateAsync({ libraryId, collectionId, data: { title: newTitle } });
      showToast(intl.formatMessage(messages.updateCollectionSuccessMsg));
    } catch {
      showToast(intl.formatMessage(messages.updateCollectionErrorMsg));
    }
  };

  if (!collection) {
    return null;
  }

  return (
    <InplaceTextEditor
      onSave={handleSaveTitle}
      text={collection.title}
      readOnly={readOnly}
      textClassName="font-weight-bold m-1.5"
    />
  );
};

export default CollectionInfoHeader;
