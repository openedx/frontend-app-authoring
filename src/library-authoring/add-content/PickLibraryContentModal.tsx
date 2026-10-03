import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, StandardModal } from '@openedx/paragon';

import { ToastContext } from '../../generic/toast-context';
import { LibraryProvider, useLibraryContext } from '../common/context/LibraryContext';
import type { SelectedComponent } from '../common/context/ComponentPickerContext';
import { useAddItemsToCollection, useAddItemsToContainer } from '../data/apiHooks';
import genericMessages from '../generic/messages';
import { allLibraryPageTabs, ContentType, useLibraryRoutes } from '../routes';
import { messages, getContentMessages } from './messages';

interface PickLibraryContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PickLibraryContentModal: React.FC<PickLibraryContentModalProps> = ({ isOpen, onClose }) => {
  const intl = useIntl();

  const {
    libraryId,
    collectionId,
    containerId,
    /** We need to get it as a reference instead of directly importing it to avoid the import cycle:
     * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
     * Sidebar > AddContent > ComponentPicker */
    componentPicker: ComponentPicker,
  } = useLibraryContext();

  const {
    insideCollection,
    insideUnit,
    insideSection,
    insideSubsection,
  } = useLibraryRoutes();

  const updateCollectionItemsMutation = useAddItemsToCollection(libraryId, collectionId);
  const updateContainerChildrenMutation = useAddItemsToContainer(containerId);

  const { showToast } = useContext(ToastContext);

  const contentMessages = useMemo(() => (
    getContentMessages(insideSection, insideSubsection, insideUnit)
  ), [insideSection, insideSubsection, insideUnit]);

  const [selectedContent, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const selectedUsageKeys = useMemo(
    () => selectedContent.map(({ usageKey }) => usageKey).filter(Boolean),
    [selectedContent],
  );
  const hasSelectedContent = selectedUsageKeys.length > 0;

  const onSubmit = useCallback(() => {
    if (!hasSelectedContent) {
      return;
    }

    if (insideCollection && collectionId) {
      updateCollectionItemsMutation.mutateAsync(selectedUsageKeys)
        .then(() => {
          showToast(intl.formatMessage(genericMessages.manageCollectionsSuccess));
          onClose();
        })
        .catch(() => {
          showToast(intl.formatMessage(genericMessages.manageCollectionsFailed));
        });
    } else if ((insideSection || insideSubsection || insideUnit) && containerId) {
      updateContainerChildrenMutation.mutateAsync(selectedUsageKeys)
        .then(() => {
          showToast(intl.formatMessage(messages.successAssociateComponentToContainerMessage));
          onClose();
        })
        .catch(() => {
          showToast(intl.formatMessage(messages.errorAssociateComponentToContainerMessage));
        });
    }
  }, [
    insideCollection,
    intl,
    onClose,
    showToast,
    updateCollectionItemsMutation,
    updateContainerChildrenMutation,
    hasSelectedContent,
    selectedUsageKeys,
    insideSection,
    insideSubsection,
    insideUnit,
    collectionId,
    containerId,
  ]);

  // determine filter an visibleTabs based on current location
  let extraFilter = ['NOT type = "collection"'];
  let visibleTabs = allLibraryPageTabs.filter((tab) => tab !== ContentType.collections);
  if (insideSection) {
    // show only subsections
    extraFilter = ['block_type = "subsection"'];
    visibleTabs = [ContentType.subsections];
  } else if (insideSubsection) {
    // show only units
    extraFilter = ['block_type = "unit"'];
    visibleTabs = [ContentType.units];
  } else if (insideUnit) {
    // show only components
    extraFilter = [
      'NOT block_type = "unit"',
      'NOT block_type = "subsection"',
      'NOT block_type = "section"',
    ];
    visibleTabs = [ContentType.components];
  }

  // istanbul ignore if: this should never happen, just here to satisfy type checker
  if (!(collectionId || containerId) || !ComponentPicker) {
    throw new Error('collectionId/containerId and componentPicker are required');
  }

  return (
    <StandardModal
      title={intl.formatMessage(contentMessages.selectContentTitle)}
      isOverflowVisible={false}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      footerNode={
        <ActionRow>
          <FormattedMessage
            {...contentMessages.selectedContent}
            values={{ count: selectedContent.length }}
          />
          <ActionRow.Spacer />
          <Button variant="primary" onClick={onSubmit} disabled={!hasSelectedContent}>
            {intl.formatMessage(contentMessages.addToButton)}
          </Button>
        </ActionRow>
      }
    >
      <LibraryProvider
        libraryId={libraryId}
        skipUrlUpdate
      >
        <ComponentPicker
          libraryId={libraryId}
          componentPickerMode="multiple"
          onChangeComponentSelection={setSelectedComponents}
          extraFilter={extraFilter}
          visibleTabs={visibleTabs}
        />
      </LibraryProvider>
    </StandardModal>
  );
};
