import React, { useCallback, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, StandardModal } from '@openedx/paragon';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import type { SelectedComponent } from '../common/context/ComponentPickerContext';
import { useAddItemsToCollection, useAddComponentsToContainer } from '../data/apiHooks';
import genericMessages from '../generic/messages';
import type { ContentType } from '../routes';
import messages from './messages';

interface PickLibraryContentModalFooterProps {
  onSubmit: () => void;
  selectedComponents: SelectedComponent[];
  buttonText: React.ReactNode;
}

const PickLibraryContentModalFooter: React.FC<PickLibraryContentModalFooterProps> = ({
  onSubmit,
  selectedComponents,
  buttonText,
}) => (
  <ActionRow>
    <FormattedMessage {...messages.selectedComponents} values={{ count: selectedComponents.length }} />
    <ActionRow.Spacer />
    <Button variant="primary" onClick={onSubmit}>
      {buttonText}
    </Button>
  </ActionRow>
);

interface PickLibraryContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  extraFilter?: string[];
  visibleTabs?: ContentType[],
}

export const PickLibraryContentModal: React.FC<PickLibraryContentModalProps> = ({
  isOpen,
  onClose,
  extraFilter,
  visibleTabs,
}) => {
  const intl = useIntl();

  const {
    libraryId,
    collectionId,
    unitId,
    /** We need to get it as a reference instead of directly importing it to avoid the import cycle:
     * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
     * Sidebar > AddContent > ComponentPicker */
    componentPicker: ComponentPicker,
  } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!(collectionId || unitId) || !ComponentPicker) {
    throw new Error('collectionId/unitId and componentPicker are required');
  }

  const updateCollectionItemsMutation = useAddItemsToCollection(libraryId, collectionId);
  const updateUnitComponentsMutation = useAddComponentsToContainer(unitId);

  const { showToast } = useContext(ToastContext);

  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);

  const onSubmit = useCallback(() => {
    const usageKeys = selectedComponents.map(({ usageKey }) => usageKey);
    onClose();
    if (collectionId) {
      updateCollectionItemsMutation.mutateAsync(usageKeys)
        .then(() => {
          showToast(intl.formatMessage(genericMessages.manageCollectionsSuccess));
        })
        .catch(() => {
          showToast(intl.formatMessage(genericMessages.manageCollectionsFailed));
        });
    }
    if (unitId) {
      updateUnitComponentsMutation.mutateAsync(usageKeys)
        .then(() => {
          showToast(intl.formatMessage(messages.successAssociateComponentToContainerMessage));
        })
        .catch(() => {
          showToast(intl.formatMessage(messages.errorAssociateComponentToContainerMessage));
        });
    }
  }, [selectedComponents]);

  return (
    <StandardModal
      title="Select components"
      isOverflowVisible={false}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      footerNode={(
        <PickLibraryContentModalFooter
          onSubmit={onSubmit}
          selectedComponents={selectedComponents}
          buttonText={(collectionId
            ? intl.formatMessage(messages.addToCollectionButton)
            : intl.formatMessage(messages.addToUnitButton)
          )}
        />
      )}
    >
      <ComponentPicker
        libraryId={libraryId}
        componentPickerMode="multiple"
        onChangeComponentSelection={setSelectedComponents}
        extraFilter={extraFilter}
        visibleTabs={visibleTabs}
      />
    </StandardModal>
  );
};
