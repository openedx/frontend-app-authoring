import React from 'react';
import { StandardModal } from '@openedx/paragon';

import type { ComponentSelectionChangedEvent } from '../common/context';
import { ComponentPicker } from './ComponentPicker';

interface ComponentPickerModalProps {
  libraryId?: string;
  isOpen: boolean;
  onClose: () => void;
  onChangeComponentSelection: ComponentSelectionChangedEvent;
  footerNode?: React.ReactNode;
}

// eslint-disable-next-line import/prefer-default-export
export const ComponentPickerModal: React.FC<ComponentPickerModalProps> = ({
  libraryId,
  isOpen,
  onClose,
  onChangeComponentSelection,
  footerNode,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <StandardModal
      title="Select components"
      isOpen={isOpen}
      onClose={onClose}
      isOverflowVisible={false}
      size="xl"
      footerNode={footerNode}
    >
      <ComponentPicker
        libraryId={libraryId}
        componentPickerMode="multiple"
        onChangeComponentSelection={onChangeComponentSelection}
      />
    </StandardModal>
  );
};
