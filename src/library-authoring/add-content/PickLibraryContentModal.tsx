import React, { useCallback, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, StandardModal } from '@openedx/paragon';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import type { SelectedComponent } from '../common/context/ComponentPickerContext';
import { useAddItemsToCollection, useAddChildrenToContainer } from '../data/apiHooks';
import genericMessages from '../generic/messages';
import { allLibraryPageTabs, ContentType, useLibraryRoutes } from '../routes';
import messages from './messages';
import Loading from '../../generic/Loading';

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
}

export const PickLibraryContentModal: React.FC<PickLibraryContentModalProps> = ({ isOpen, onClose }) => {
  const intl = useIntl();

  const {
    libraryId,
    collectionId,
    sectionId,
    subsectionId,
    unitId,
    /** We need to get it as a reference instead of directly importing it to avoid the import cycle:
     * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
     * Sidebar > AddContent > ComponentPicker */
    componentPicker: ComponentPicker,
  } = useLibraryContext();

  const {
    insideCollection, insideUnit, insideSection, insideSubsection,
  } = useLibraryRoutes();

  const updateCollectionItemsMutation = useAddItemsToCollection(libraryId, collectionId);
  const updateContainerChildrenMutation = useAddChildrenToContainer(
    (insideSection && sectionId)
    || (insideSubsection && subsectionId)
    || (insideUnit && unitId)
    || '',
  );

  const { showToast } = useContext(ToastContext);

  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);

  const onSubmit = useCallback(() => {
    const usageKeys = selectedComponents.map(({ usageKey }) => usageKey);
    onClose();
    if (insideCollection && collectionId) {
      updateCollectionItemsMutation.mutateAsync(usageKeys)
        .then(() => {
          showToast(intl.formatMessage(genericMessages.manageCollectionsSuccess));
        })
        .catch(() => {
          showToast(intl.formatMessage(genericMessages.manageCollectionsFailed));
        });
    } else if (insideSection || insideSubsection || insideUnit) {
      updateContainerChildrenMutation.mutateAsync(usageKeys)
        .then(() => {
          showToast(intl.formatMessage(messages.successAssociateComponentToContainerMessage));
        })
        .catch(() => {
          showToast(intl.formatMessage(messages.errorAssociateComponentToContainerMessage));
        });
    }
  }, [
    selectedComponents,
    insideSection,
    insideSubsection,
    insideUnit,
    collectionId,
    sectionId,
    subsectionId,
    unitId,
  ]);

  // determine filter an visibleTabs based on current location
  let extraFilter = ['NOT type = "collection"'];
  let visibleTabs = allLibraryPageTabs.filter((tab) => tab !== ContentType.collections);
  let addBtnText = messages.addToCollectionButton;
  if (insideSection) {
    // show only subsections
    extraFilter = ['block_type = "subsection"'];
    addBtnText = messages.addToSectionButton;
    visibleTabs = [ContentType.home];
  } else if (insideSubsection) {
    // show only units
    extraFilter = ['block_type = "unit"'];
    addBtnText = messages.addToSubsectionButton;
    visibleTabs = [ContentType.units];
  } else if (insideUnit) {
    // show only components
    extraFilter = [
      'NOT block_type = "unit"',
      'NOT type = "collection"',
      'NOT block_type = "subsection"',
      'NOT block_type = "section"',
    ];
    addBtnText = messages.addToUnitButton;
    visibleTabs = [ContentType.components];
  }

  // The ids will be set based on current url
  if (!(collectionId || unitId || sectionId || subsectionId)) {
    return <Loading />;
  }

  if (!ComponentPicker) {
    throw new Error('componentPicker is required');
  }

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
          buttonText={intl.formatMessage(addBtnText)}
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
