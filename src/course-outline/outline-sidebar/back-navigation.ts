import { SelectionState, XBlock } from '@src/data/types';

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
 * Inputs for generic "back" navigation resolution.
 */
type NavigateBackOptions = {
  /** Current selection state in sidebar context. */
  selectedContainerState: SelectionState | undefined;
  /** Sections list from course outline context (used for parent index lookup). */
  sections: Array<XBlock>;
  /** Callback used to open a container sidebar (align/info/add flavors). */
  openContainer: OpenContainerFn;
  /** Fallback action when no parent target exists. */
  clearSelection: () => void;
  /**
   * Optional authoritative selected section payload.
   * Useful when section list is partial/minimal in tests or callers.
   */
  selectedSection?: XBlock;
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
 * Execute generic back navigation for outline sidebars.
 *
 * Flow:
 * 1) Compute parent selection state.
 * 2) If parent exists, open parent and optionally sync external selection.
 * 3) Else clear selection and optionally sync undefined.
 */
export const navigateBackFromSelection = ({
  selectedContainerState,
  sections,
  openContainer,
  clearSelection,
  selectedSection,
  onSelectionChange,
}: NavigateBackOptions) => {
  const backSelectionState = getBackSelectionState(selectedContainerState, sections, selectedSection);

  if (backSelectionState) {
    openSelectionState(openContainer, backSelectionState);
    onSelectionChange?.(backSelectionState);
    return;
  }

  clearSelection();
  onSelectionChange?.(undefined);
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
