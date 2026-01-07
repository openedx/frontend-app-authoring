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
}

export type ComponentSelectedEvent = (selectedComponent: SelectedComponent) => void;
export type ComponentSelectionChangedEvent = (selectedComponents: SelectedComponent[]) => void;

type NoComponentPickerType = {
  componentPickerMode: false;
  /** We add the `never` type to ensure that the other properties are not used,
   * but allow it to be desconstructed from the return value of `useComponentPickerContext()`
   */
  onComponentSelected?: never;
  selectedComponents?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
  restrictToLibrary?: never;
  showOnlyPublished?: never;
  extraFilter?: never;
};

type BasePickerType = {
  restrictToLibrary: boolean;
  showOnlyPublished: boolean;
  extraFilter: string[],
}

type ComponentPickerSingleType = BasePickerType & {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  selectedComponents?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
};

type ComponentPickerMultipleType = BasePickerType & {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  selectedComponents: SelectedComponent[];
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
  showOnlyPublished?: boolean;
  extraFilter?: string[],
}

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
  showOnlyPublished = false,
  extraFilter,
}: ComponentPickerProviderProps) => {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);

  const addComponentToSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
  ) => {
    setSelectedComponents((prevSelectedComponents) => {
      // istanbul ignore if: this should never happen
      if (prevSelectedComponents.some((component) => component.usageKey === selectedComponent.usageKey)) {
        return prevSelectedComponents;
      }
      const newSelectedComponents = [...prevSelectedComponents, selectedComponent];
      onChangeComponentSelection?.(newSelectedComponents);
      return newSelectedComponents;
    });
  }, []);

  const removeComponentFromSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
  ) => {
    setSelectedComponents((prevSelectedComponents) => {
      // istanbul ignore if: this should never happen
      if (!prevSelectedComponents.some((component) => component.usageKey === selectedComponent.usageKey)) {
        return prevSelectedComponents;
      }
      const newSelectedComponents = prevSelectedComponents.filter(
        (component) => component.usageKey !== selectedComponent.usageKey,
      );
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
          showOnlyPublished,
          extraFilter: extraFilter || [],
        };
      case 'multiple':
        return {
          componentPickerMode,
          restrictToLibrary,
          selectedComponents,
          addComponentToSelectedComponents,
          removeComponentFromSelectedComponents,
          showOnlyPublished,
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
    showOnlyPublished,
    extraFilter,
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
