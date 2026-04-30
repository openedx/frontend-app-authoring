import { useCallback } from 'react';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { SelectionState, XBlock } from '@src/data/types';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

/**
 * Function signature shared by sidebar container openers.
 *
 * Example implementations:
 * - openContainerSidebar
 * - openContainerInfoSidebar
 */
type OpenContainerFn = (
  containerId: string,
  subsectionId?: string,
  sectionId?: string,
  index?: number,
) => void;

/**
 * Inputs for useBackNavigation hook.
 */
type UseBackNavigationOptions = {
  /** Callback used to open a container sidebar (align/info/add flavors). */
  openContainer: OpenContainerFn;
  /** Optional hook to sync external selection state (e.g. align view selection). */
  onSelectionChange?: (selectionState?: SelectionState) => void;
};

/**
 * Open sidebar using an already-computed SelectionState.
 */
export const openSelectionState = (
  openContainer: OpenContainerFn,
  selectionState: SelectionState,
) => {
  openContainer(
    selectionState.currentId,
    selectionState.subsectionId,
    selectionState.sectionId,
    selectionState.index,
  );
};

/**
 * Hook that returns standardized sidebar "back" handler.
 *
 * It pulls required state from context/hooks:
 * - selectedContainerState + clearSelection (sidebar context)
 * - sections (course outline context)
 * - selected section data via useCourseItemData (React Query cache)
 */
export const useBackNavigation = ({ openContainer, onSelectionChange }: UseBackNavigationOptions) => {
  const { sections } = useCourseOutlineContext();
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();
  const { data: selectedSection } = useCourseItemData<XBlock>(
    selectedContainerState?.sectionId,
    undefined,
    Boolean(selectedContainerState?.sectionId),
  );

  return useCallback(() => {
    const backSelectionState = getBackSelectionState(selectedContainerState, sections, selectedSection);

    if (backSelectionState) {
      openSelectionState(openContainer, backSelectionState);
      onSelectionChange?.(backSelectionState);
      return;
    }

    clearSelection();
    onSelectionChange?.(undefined);
  }, [selectedContainerState, sections, selectedSection, openContainer, onSelectionChange, clearSelection]);
};

/**
 * Resolve parent SelectionState for "back" action.
 *
 * Rules:
 * - unit -> subsection
 * - subsection -> section
 * - section -> undefined (clear)
 * - missing ancestry -> undefined (clear)
 */
export const getBackSelectionState = (
  selectedContainerState: SelectionState | undefined,
  sections: Array<XBlock>,
  selectedSection?: XBlock,
): SelectionState | undefined => {
  const { currentId, subsectionId, sectionId } = selectedContainerState || {};

  if (!currentId) {
    return undefined;
  }

  const sectionIndex = sections.findIndex((section) => section.id === sectionId);
  const section = sectionIndex >= 0 ? sections[sectionIndex] : undefined;
  const sectionChildren = selectedSection?.id === sectionId
    ? selectedSection?.childInfo?.children
    : section?.childInfo?.children;
  const subsectionIndex = sectionChildren?.findIndex((subsection) => subsection.id === subsectionId) ?? -1;

  // Back from subsection -> section parent.
  if (currentId === subsectionId) {
    if (!sectionId) {
      return undefined;
    }

    return {
      currentId: sectionId,
      sectionId,
      index: sectionIndex >= 0 ? sectionIndex : undefined,
    };
  }

  // Back from section -> no parent container in sidebar hierarchy.
  if (currentId === sectionId) {
    return undefined;
  }

  // Back from unit (or any deeper child) -> subsection parent.
  if (subsectionId) {
    return {
      currentId: subsectionId,
      subsectionId,
      sectionId,
      index: subsectionIndex >= 0 ? subsectionIndex : undefined,
    };
  }

  return undefined;
};
