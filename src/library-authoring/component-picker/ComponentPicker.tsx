import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Stepper } from '@openedx/paragon';

import { LibraryProvider, useLibraryContext } from '../common/context';
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

// eslint-disable-next-line import/prefer-default-export
export const ComponentPicker = () => {
  const [currentStep, setCurrentStep] = useState('select-library');
  const [selectedLibrary, setSelectedLibrary] = useState('');

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const variant = queryParams.get('variant') || 'draft';

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
        <LibraryProvider libraryId={selectedLibrary} componentPickerMode showOnlyPublished={variant === 'published'}>
          <InnerComponentPicker returnToLibrarySelection={returnToLibrarySelection} />
        </LibraryProvider>
      </Stepper.Step>
    </Stepper>
  );
};
