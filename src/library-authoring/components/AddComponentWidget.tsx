import { useMemo } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import {
  AddCircleOutline,
  CheckBoxIcon,
  IndeterminateCheckBox,
  CheckBoxOutlineBlank,
} from '@openedx/paragon/icons';

import { ContentHit, useSearchContext } from '@src/search-manager';
import { SelectedComponent, useComponentPickerContext } from '../common/context/ComponentPickerContext';
import messages from './messages';

interface AddComponentWidgetProps {
  usageKey: string;
  blockType: string;
  collectionKeys?: string[];
  isCollection?: boolean;
}

/**
 * Builds an array of SelectedComponent from collection hits.
 */
const buildCollectionComponents = (
  hits: ReturnType<typeof useSearchContext>['hits'],
  collectionUsageKey: string,
): SelectedComponent[] => hits
  .filter((hit) => hit.type === 'library_block' && hit.collections?.key?.includes(collectionUsageKey))
  .map((hit: ContentHit) => ({
    usageKey: hit.usageKey,
    blockType: hit.blockType,
    collectionKeys: (hit as ContentHit).collections?.key,
  }));

/**
 * Counts the number of hits that share a collection key with the given component.
 */
const countCollectionHits = (
  hits: ReturnType<typeof useSearchContext>['hits'],
  componentCollectionKey: string[] | undefined,
): number => {
  if (!componentCollectionKey?.length) {
    return 0;
  }
  return hits.filter(
    (hit) => (hit as ContentHit).collections?.key?.some((key) => componentCollectionKey.includes(key)),
  ).length;
};

const AddComponentWidget = ({
  usageKey, blockType, collectionKeys, isCollection,
}: AddComponentWidgetProps) => {
  const intl = useIntl();

  const {
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
    selectedCollections,
  } = useComponentPickerContext();

  const { hits } = useSearchContext();

  const collectionData = useMemo(() => {
    // When selecting a collection: retrieve all its components to enable bulk selection
    if (isCollection) {
      return buildCollectionComponents(hits, usageKey);
    }
    // When selecting an individual component: get the total count of components in its collection
    // This count is used to determine if the entire collection should be marked as selected
    const componentCollectionKey = (hits.find((hit) => hit.usageKey === usageKey) as ContentHit)?.collections?.key;
    return countCollectionHits(hits, componentCollectionKey);
  }, [hits, usageKey, isCollection]);

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  // istanbul ignore if: this should never happen
  if (!componentPickerMode) {
    return null;
  }

  if (componentPickerMode === 'single') {
    return (
      <Button
        variant="outline-primary"
        iconBefore={AddCircleOutline}
        onClick={() => {
          onComponentSelected({ usageKey, blockType });
        }}
      >
        <FormattedMessage {...messages.componentPickerSingleSelectTitle} />
      </Button>
    );
  }

  if (componentPickerMode === 'multiple') {
    const collectionStatus = selectedCollections.find((c) => c.key === usageKey)?.status;

    const isChecked = isCollection
      ? collectionStatus === 'selected'
      : selectedComponents.some((component) => component.usageKey === usageKey);

    const isIndeterminate = isCollection && collectionStatus === 'indeterminate';

    const getIcon = () => {
      if (isChecked) { return CheckBoxIcon; }
      if (isIndeterminate) { return IndeterminateCheckBox; }
      return CheckBoxOutlineBlank;
    };

    const handleChange = () => {
      const selectedComponent: SelectedComponent = {
        usageKey,
        blockType,
        collectionKeys,
      };
      if (!isChecked) {
        addComponentToSelectedComponents(selectedComponent, collectionData);
      } else {
        removeComponentFromSelectedComponents(selectedComponent, collectionData);
      }
    };

    return (
      <Button
        variant="outline-primary"
        iconBefore={getIcon()}
        onClick={handleChange}
      >
        {intl.formatMessage(messages.componentPickerMultipleSelectTitle)}
      </Button>
    );
  }

  // istanbul ignore next: this should never happen
  return null;
};

export default AddComponentWidget;
