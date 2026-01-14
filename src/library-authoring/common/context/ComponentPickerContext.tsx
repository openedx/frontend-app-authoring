import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface SelectedComponent {
  usageKey: string;
  blockType: string;
  collectionKeys?: string[];
}

export type CollectionStatus = 'selected' | 'indeterminate';

export interface SelectedCollection {
  key: string;
  status: CollectionStatus;
}

export type ComponentSelectedEvent = (
  selectedComponent: SelectedComponent,
  collectionComponents?: SelectedComponent[] | number
) => void;
export type ComponentSelectionChangedEvent = (selectedComponents: SelectedComponent[]) => void;

type NoComponentPickerType = {
  componentPickerMode: false;
  /** We add the `never` type to ensure that the other properties are not used,
   * but allow it to be desconstructed from the return value of `useComponentPickerContext()`
   */
  onComponentSelected?: never;
  selectedComponents?: never;
  selectedCollections?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
  restrictToLibrary?: never;
  extraFilter?: never;
};

type BasePickerType = {
  restrictToLibrary: boolean;
  extraFilter: string[],
};

type ComponentPickerSingleType = BasePickerType & {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  selectedComponents?: never;
  selectedCollections?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
};

type ComponentPickerMultipleType = BasePickerType & {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  selectedComponents: SelectedComponent[];
  selectedCollections: SelectedCollection[];
  addComponentToSelectedComponents: ComponentSelectedEvent;
  removeComponentFromSelectedComponents: ComponentSelectedEvent;
};

type ComponentPickerContextData = ComponentPickerSingleType | ComponentPickerMultipleType;

/**
 * Component Picker Context.
 * This context is used to provide the component picker mode and the selected components.
 *
 * Get this using `useComponentPickerContext()`
 */
const ComponentPickerContext = createContext<ComponentPickerContextData | undefined>(undefined);

type BasePickerProps = {
  restrictToLibrary?: boolean;
  /** Only show published components */
  extraFilter?: string[],
};

export type ComponentPickerSingleProps = BasePickerProps & {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  onChangeComponentSelection?: never;
};

export type ComponentPickerMultipleProps = BasePickerProps & {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  onChangeComponentSelection?: ComponentSelectionChangedEvent;
};

type ComponentPickerProps = ComponentPickerSingleProps | ComponentPickerMultipleProps;

type ComponentPickerProviderProps = {
  children?: React.ReactNode;
} & ComponentPickerProps;

/**
 * React component to provide `ComponentPickerContext`
 */
export const ComponentPickerProvider = ({
  children,
  componentPickerMode,
  restrictToLibrary = false,
  onComponentSelected,
  onChangeComponentSelection,
  extraFilter,
}: ComponentPickerProviderProps) => {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<SelectedCollection[]>([]);

  /**
   * Updates the selectedCollections state based on how many components are selected.
   * @param collectionKey - The key of the collection to update
   * @param selectedCount - Number of components currently selected in the collection
   * @param totalCount - Total number of components in the collection
   */
  const updateCollectionStatus = useCallback((
    collectionKey: string,
    selectedCount: number,
    totalCount: number,
  ) => {
    setSelectedCollections((prevSelectedCollections) => {
      const filteredCollections = prevSelectedCollections.filter(
        (collection) => collection.key !== collectionKey,
      );

      if (selectedCount === 0) {
        return filteredCollections;
      }
      if (selectedCount >= totalCount) {
        return [...filteredCollections, { key: collectionKey, status: 'selected' as CollectionStatus }];
      }
      return [...filteredCollections, { key: collectionKey, status: 'indeterminate' as CollectionStatus }];
    });
  }, []);

  /**
   * Finds the common collection key between a component and selected components.
   */
  const findCommonCollectionKey = useCallback((
    componentKeys: string[] | undefined,
    components: SelectedComponent[],
  ): string | undefined => {
    if (!componentKeys?.length || !components.length) {
      return undefined;
    }

    for (const component of components) {
      const commonKey = component.collectionKeys?.find((key) => componentKeys.includes(key));
      if (commonKey) {
        return commonKey;
      }
    }

    return undefined;
  }, []);

  const addComponentToSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
    collectionComponents?: SelectedComponent[] | number,
  ) => {
    const componentsToAdd = Array.isArray(collectionComponents) && collectionComponents.length
      ? collectionComponents
      : [selectedComponent];

    setSelectedComponents((prevSelectedComponents) => {
      const existingKeys = new Set(prevSelectedComponents.map((c) => c.usageKey));
      const newComponents = componentsToAdd.filter((c) => !existingKeys.has(c.usageKey));

      if (newComponents.length === 0) {
        return prevSelectedComponents;
      }

      const newSelectedComponents = [...prevSelectedComponents, ...newComponents];

      // Handle collection selection (when selecting entire collection)
      if (Array.isArray(collectionComponents) && collectionComponents.length) {
        updateCollectionStatus(
          selectedComponent.usageKey,
          collectionComponents.length,
          collectionComponents.length,
        );
      }

      // Handle individual component selection (with total count)
      if (typeof collectionComponents === 'number') {
        const componentCollectionKeys = selectedComponent.collectionKeys;
        const selectedCollectionComponents = newSelectedComponents.filter(
          (component) => component.collectionKeys?.some(
            (key) => componentCollectionKeys?.includes(key),
          ),
        );

        const collectionKey = findCommonCollectionKey(
          componentCollectionKeys,
          selectedCollectionComponents,
        );

        if (collectionKey) {
          updateCollectionStatus(
            collectionKey,
            selectedCollectionComponents.length,
            collectionComponents,
          );
        }
      }

      onChangeComponentSelection?.(newSelectedComponents);
      return newSelectedComponents;
    });
  }, []);

  const removeComponentFromSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
    collectionComponents?: SelectedComponent[] | number,
  ) => {
    const componentsToRemove = Array.isArray(collectionComponents) && collectionComponents.length
      ? collectionComponents
      : [selectedComponent];
    const usageKeysToRemove = new Set(componentsToRemove.map((c) => c.usageKey));

    setSelectedComponents((prevSelectedComponents) => {
      const newSelectedComponents = prevSelectedComponents.filter(
        (component) => !usageKeysToRemove.has(component.usageKey),
      );

      if (typeof collectionComponents === 'number') {
        const componentCollectionKeys = selectedComponent.collectionKeys;
        const collectionKey = findCommonCollectionKey(componentCollectionKeys, componentsToRemove);

        if (collectionKey) {
          const remainingCollectionComponents = newSelectedComponents.filter(
            (component) => component.collectionKeys?.includes(collectionKey),
          );
          updateCollectionStatus(
            collectionKey,
            remainingCollectionComponents.length,
            collectionComponents,
          );
        }
      } else {
        // Fallback: remove collections that have no remaining components
        setSelectedCollections((prevSelectedCollections) => prevSelectedCollections.filter(
          (collection) => newSelectedComponents.some(
            (component) => component.collectionKeys?.includes(collection.key),
          ),
        ));
      }

      onChangeComponentSelection?.(newSelectedComponents);
      return newSelectedComponents;
    });
  }, []);

  const context = useMemo<ComponentPickerContextData>(() => {
    switch (componentPickerMode) {
      case 'single':
        return {
          componentPickerMode,
          restrictToLibrary,
          onComponentSelected,
          extraFilter: extraFilter || [],
        };
      case 'multiple':
        return {
          componentPickerMode,
          restrictToLibrary,
          selectedCollections,
          selectedComponents,
          addComponentToSelectedComponents,
          removeComponentFromSelectedComponents,
          extraFilter: extraFilter || [],
        };
      default:
        // istanbul ignore next: this should never happen
        throw new Error('Invalid component picker mode');
    }
  }, [
    componentPickerMode,
    restrictToLibrary,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
    onChangeComponentSelection,
    extraFilter,
    selectedCollections,
  ]);

  return (
    <ComponentPickerContext.Provider value={context}>
      {children}
    </ComponentPickerContext.Provider>
  );
};

export function useComponentPickerContext(): ComponentPickerContextData | NoComponentPickerType {
  const ctx = useContext(ComponentPickerContext);
  if (ctx === undefined) {
    return {
      componentPickerMode: false,
    };
  }
  return ctx;
}
