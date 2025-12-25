import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Stepper } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  type ComponentSelectedEvent,
  type ComponentSelectionChangedEvent,
  ComponentPickerProvider,
} from '../common/context/ComponentPickerContext';
import { LibraryIdOneOrMore, LibraryProvider, useLibraryContext } from '../common/context/LibraryContext';
import { SidebarProvider } from '../common/context/SidebarContext';
import LibraryAuthoringPage from '../LibraryAuthoringPage';
import LibraryCollectionPage from '../collections/LibraryCollectionPage';
import SelectLibrary from './SelectLibrary';
import messages from './messages';
import { ContentType, allLibraryPageTabs } from '../routes';
import { AtLeastOne } from '../../types';
import { FiltersProps } from '@src/library-authoring/library-filters';

interface LibraryComponentPickerProps {
  returnToLibrarySelection: () => void;
  visibleTabs: ContentType[],
  FiltersComponent?: React.ComponentType<FiltersProps>;
}

const InnerComponentPicker: React.FC<LibraryComponentPickerProps> = ({
  returnToLibrarySelection,
  visibleTabs,
  FiltersComponent,
}) => {
  const { collectionId } = useLibraryContext();

  if (collectionId) {
    return <LibraryCollectionPage />;
  }
  return (
    <LibraryAuthoringPage
      returnToLibrarySelection={returnToLibrarySelection}
      visibleTabs={visibleTabs}
      FiltersComponent={FiltersComponent}
    />
  );
};

/** Default handler in single-select mode. Used by the legacy UI for adding a single selected component to a course. */
const defaultComponentSelectedCallback: ComponentSelectedEvent = ({ usageKey, blockType }) => {
  window.parent.postMessage({ usageKey, type: 'pickerComponentSelected', category: blockType }, '*');
};

/** Default handler in multi-select mode. Used by the legacy UI for adding components to a problem bank. */
const defaultSelectionChangedCallback: ComponentSelectionChangedEvent = (selections) => {
  window.parent.postMessage({ type: 'pickerSelectionChanged', selections }, '*');
};

type ComponentPickerProps = AtLeastOne<LibraryIdOneOrMore> & {
  showOnlyPublished?: boolean,
  extraFilter?: string[],
  visibleTabs?: ContentType[],
  componentPickerMode?: 'single' | 'multiple',
  onComponentSelected?: ComponentSelectedEvent,
  onChangeComponentSelection?: ComponentSelectionChangedEvent,
  selectLibrary?: boolean;
  FiltersComponent?: React.ComponentType<FiltersProps>;
};

export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  /** Restrict the component picker to a specific library */
  libraryId,
  libraryIds,
  showOnlyPublished,
  extraFilter,
  componentPickerMode = 'single',
  visibleTabs = allLibraryPageTabs,
  /** This default callback is used to send the selected component back to the parent window,
   * when the component picker is used in an iframe.
   */
  onComponentSelected = defaultComponentSelectedCallback,
  onChangeComponentSelection = defaultSelectionChangedCallback,
  selectLibrary = true,
  FiltersComponent,
}) => {
  const [currentStep, setCurrentStep] = useState(!libraryId && selectLibrary ? 'select-library' : 'pick-components');
  const [selectedLibrary, setSelectedLibrary] = useState(libraryId);

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const variant = queryParams.get('variant') || 'draft';
  const calcShowOnlyPublished = variant === 'published' || showOnlyPublished;

  const handleLibrarySelection = (library: string) => {
    setCurrentStep('pick-components');
    setSelectedLibrary(library);
  };

  const returnToLibrarySelection = () => {
    setCurrentStep('select-library');
    setSelectedLibrary('');
  };

  const restrictToLibrary = !!libraryId;

  const componentPickerProviderProps = componentPickerMode === 'single' ? {
    componentPickerMode,
    onComponentSelected,
    restrictToLibrary,
  } : {
    componentPickerMode,
    onChangeComponentSelection,
    restrictToLibrary,
  };

  return (
    <Stepper
      activeKey={currentStep}
    >
      <Stepper.Step eventKey="select-library" title="Select a library">
        <SelectLibrary
          selectedLibrary={selectedLibrary}
          setSelectedLibrary={handleLibrarySelection}
          itemType={visibleTabs.length === 1 ? visibleTabs[0] : ContentType.components}
        />
      </Stepper.Step>

      <Stepper.Step eventKey="pick-components" title="Pick some components">
        <ComponentPickerProvider {...componentPickerProviderProps}>
          <LibraryProvider
            libraryId={selectedLibrary}
            libraryIds={libraryIds || []}
            showOnlyPublished={calcShowOnlyPublished}
            extraFilter={extraFilter}
            skipUrlUpdate
          >
            <SidebarProvider>
              { calcShowOnlyPublished
                && (
                <Alert variant="info" className="m-2">
                  <FormattedMessage {...messages.pickerInfoBanner} />
                </Alert>
                )}
              <InnerComponentPicker
                returnToLibrarySelection={returnToLibrarySelection}
                visibleTabs={visibleTabs}
                FiltersComponent={FiltersComponent}
              />
            </SidebarProvider>
          </LibraryProvider>
        </ComponentPickerProvider>
      </Stepper.Step>
    </Stepper>
  );
};
