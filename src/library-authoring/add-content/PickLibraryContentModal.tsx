import React, { useCallback, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, StandardModal } from '@openedx/paragon';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import type { SelectedComponent } from '../common/context/ComponentPickerContext';
import { useAddComponentsToCollection } from '../data/apiHooks';
import messages from './messages';

interface PickLibraryContentModalFooterProps {
  onSubmit: () => void;
  selectedComponents: SelectedComponent[];
}

const PickLibraryContentModalFooter: React.FC<PickLibraryContentModalFooterProps> = ({
  onSubmit,
  selectedComponents,
}) => (
  <ActionRow>
    <FormattedMessage {...messages.selectedComponents} values={{ count: selectedComponents.length }} />
    <ActionRow.Spacer />
    <Button variant="primary" onClick={onSubmit}>
      <FormattedMessage {...messages.addToCollectionButton} />
    </Button>
  </ActionRow>
);

interface PickLibraryContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PickLibraryContentModal: React.FC<PickLibraryContentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const intl = useIntl();

  const {
    libraryId,
    collectionId,
    /** We need to get it as a reference instead of directly importing it to avoid the import cycle:
     * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
     * Sidebar > AddContentContainer > ComponentPicker */
    componentPicker: ComponentPicker,
  } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!collectionId || !ComponentPicker) {
    throw new Error('libraryId and componentPicker are required');
  }

  const updateComponentsMutation = useAddComponentsToCollection(libraryId, collectionId);

  const { showToast } = useContext(ToastContext);

  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);

  const onSubmit = useCallback(() => {
    const usageKeys = selectedComponents.map(({ usageKey }) => usageKey);
    onClose();
    updateComponentsMutation.mutateAsync(usageKeys)
      .then(() => {
        showToast(intl.formatMessage(messages.successAssociateComponentMessage));
      })
      .catch(() => {
        showToast(intl.formatMessage(messages.errorAssociateComponentMessage));
      });
  }, [selectedComponents]);

  return (
    <StandardModal
      title="Select components"
      isOverflowVisible={false}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      footerNode={<PickLibraryContentModalFooter onSubmit={onSubmit} selectedComponents={selectedComponents} />}
    >
      <ComponentPicker
        libraryId={libraryId}
        componentPickerMode="multiple"
        onChangeComponentSelection={setSelectedComponents}
      />
    </StandardModal>
  );
};
