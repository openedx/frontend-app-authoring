import React, { useState } from 'react';
import { Stepper } from '@openedx/paragon';

import { type ComponentPickerMode, LibraryProvider, useLibraryContext } from '../common/context';
import LibraryAuthoringPage from '../LibraryAuthoringPage';
import LibraryCollectionPage from '../collections/LibraryCollectionPage';
import SelectLibrary from './SelectLibrary';

interface LibraryComponentPickerProps {
  returnToLibrarySelection: () => void;
}

const InnerComponentPicker: React.FC<LibraryComponentPickerProps> = ({ returnToLibrarySelection }) => {
  const { collectionId } = useLibraryContext();

  if (collectionId) {
    return <LibraryCollectionPage />;
  }
  return <LibraryAuthoringPage returnToLibrarySelection={returnToLibrarySelection} />;
};

const defaultComponentSelectedCallback = (usageKey: string, category: string) => {
  window.parent.postMessage({
    usageKey,
    type: 'pickerComponentSelected',
    category,
  }, '*');
};

interface ComponentPickerProps {
  onComponentSelected?: (usageKey: string, category: string) => void;
  componentPickerMode?: ComponentPickerMode;
}

// eslint-disable-next-line import/prefer-default-export
export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  componentPickerMode = 'single',
  /** This default callback is used to send the selected component back to the parent window,
   * when the component picker is used in an iframe.
   */
  onComponentSelected = defaultComponentSelectedCallback,
}) => {
  const [currentStep, setCurrentStep] = useState('select-library');
  const [selectedLibrary, setSelectedLibrary] = useState('');

  const handleLibrarySelection = (library: string) => {
    setCurrentStep('pick-components');
    setSelectedLibrary(library);
  };

  const returnToLibrarySelection = () => {
    setCurrentStep('select-library');
    setSelectedLibrary('');
  };

  return (
    <Stepper
      activeKey={currentStep}
    >
      <Stepper.Step eventKey="select-library" title="Select a library">
        <SelectLibrary selectedLibrary={selectedLibrary} setSelectedLibrary={handleLibrarySelection} />
      </Stepper.Step>

      <Stepper.Step eventKey="pick-components" title="Pick some components">
        <LibraryProvider
          libraryId={selectedLibrary}
          componentPickerMode={componentPickerMode}
          onComponentSelected={onComponentSelected}
        >
          <InnerComponentPicker returnToLibrarySelection={returnToLibrarySelection} />
        </LibraryProvider>
      </Stepper.Step>
    </Stepper>
  );
};
