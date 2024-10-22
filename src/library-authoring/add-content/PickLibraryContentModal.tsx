import React, { useCallback, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button } from '@openedx/paragon';
import { useParams } from 'react-router-dom';

import { ToastContext } from '../../generic/toast-context';
import { type SelectedComponent, useLibraryContext } from '../common/context';
// eslint-disable-next-line import/no-cycle
import { ComponentPickerModal } from '../component-picker';
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

// eslint-disable-next-line import/prefer-default-export
export const PickLibraryContentModal: React.FC<PickLibraryContentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const intl = useIntl();

  const { collectionId } = useParams();
  const {
    libraryId,
  } = useLibraryContext();

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
    <ComponentPickerModal
      libraryId={libraryId}
      isOpen={isOpen}
      onClose={onClose}
      onChangeComponentSelection={setSelectedComponents}
      footerNode={<PickLibraryContentModalFooter onSubmit={onSubmit} selectedComponents={selectedComponents} />}
    />
  );
};
