import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Stepper } from '@openedx/paragon';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { LibraryProvider, useLibraryContext } from '../common/context';
import LibraryAuthoringPage from '../LibraryAuthoringPage';
import LibraryCollectionPage from '../collections/LibraryCollectionPage';
import SelectLibrary from './SelectLibrary';
import messages from './messages';

const InnerComponentPicker = () => {
  const { collectionId } = useLibraryContext();

  if (collectionId) {
    return <LibraryCollectionPage />;
  }
  return <LibraryAuthoringPage />;
};

// eslint-disable-next-line import/prefer-default-export
export const ComponentPicker = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  let parentLocator = searchParams.get('parentLocator');

  // istanbul ignore if: this should never happen
  if (!parentLocator) {
    throw new Error('parentLocator is required');
  }

  // URLSearchParams decodes '+' to ' ', so we need to convert it back
  parentLocator = parentLocator.replaceAll(' ', '+');

  const [currentStep, setCurrentStep] = useState('select-library');
  const [selectedLibrary, setSelectedLibrary] = useState('');

  return (
    <Stepper
      activeKey={currentStep}
    >
      <Stepper.Step eventKey="select-library" title="Select a library" error={!selectedLibrary}>
        <SelectLibrary setSelectLibrary={setSelectedLibrary} />
      </Stepper.Step>

      <Stepper.Step eventKey="pick-components" title="Pick some components">
        <LibraryProvider libraryId={selectedLibrary} parentLocator={parentLocator} componentPickerMode>
          <InnerComponentPicker />
        </LibraryProvider>
      </Stepper.Step>

      <div className="py-3">
        <Stepper.ActionRow eventKey="select-library">
          <Stepper.ActionRow.Spacer />
          <Button onClick={() => setCurrentStep('pick-components')}>
            {intl.formatMessage(messages.selectLibraryNextButton)}
          </Button>
        </Stepper.ActionRow>

        <Stepper.ActionRow eventKey="pick-components">
          <Button variant="outline-primary" onClick={() => setCurrentStep('select-library')}>
            {intl.formatMessage(messages.pickComponentPreviousButton)}
          </Button>
        </Stepper.ActionRow>
      </div>
    </Stepper>
  );
};
