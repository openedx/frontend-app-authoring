import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useCollection, useUpdateCollection } from '../data/apiHooks';
import messages from './messages';

const CollectionInfoHeader = () => {
  const intl = useIntl();

  const { libraryId, readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const collectionId = sidebarComponentInfo?.id;

  // istanbul ignore if: this should never happen
  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  const { data: collection } = useCollection(libraryId, collectionId);

  const updateMutation = useUpdateCollection(libraryId, collectionId);
  const { showToast } = useContext(ToastContext);

  const handleSaveTitle = async (newTitle: string) => {
    try {
      await updateMutation.mutateAsync({
        title: newTitle,
      });
      showToast(intl.formatMessage(messages.updateCollectionSuccessMsg));
    } catch (err) {
      showToast(intl.formatMessage(messages.updateCollectionErrorMsg));
      throw err;
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
