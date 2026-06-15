/**
 * Outline Level Module
 *
 * Owns depth-level configuration and parent-chain payload builders for the course outline tree.
 * Extracts depth-dependent logic from OutlineNode.tsx and OutlineTree.tsx into pure, testable functions.
 *
 * Key concepts:
 * - Depth: 0 = section, 1 = subsection, 2 = unit
 * - Ancestors: Parent chain (section always defined, subsection only at depth 2)
 * - Builders: Pure functions that produce typed payloads for modals, sidebar, and actions
 */

import type { CSSProperties } from 'react';
import { ContainerType } from '@src/generic/key-utils';
import type {
  OutlineActionSelection,
  SelectionState,
  XBlock,
  XBlockActions,
} from '@src/data/types';
import { courseIDtoBlockID } from './utils';
import type { MoveDetails } from './drag-helper/utils';
import { isEmpty } from 'lodash';

/**
 * Tree depth: 0 = section, 1 = subsection, 2 = unit.
 */
export type Depth = 0 | 1 | 2;

/**
 * Level name corresponding to each depth.
 */
export type LevelName = 'section' | 'subsection' | 'unit';

/**
 * Static configuration for each outline level.
 */
export interface LevelConfig {
  readonly name: LevelName;
  readonly contentClass: string;
  readonly contentTestId: string;
  readonly childContainerClass?: string;
  readonly childContainerTestId?: string;
  readonly containerType?: ContainerType;
  readonly iconSize: 'md' | 'sm' | 'xs';
  readonly background: CSSProperties;
}

/**
 * Parent chain for an outline node.
 *
 * - At depth 0 (section): section = block itself, subsection = undefined
 * - At depth 1 (subsection): section = parent section, subsection = undefined
 * - At depth 2 (unit): section = grandparent section, subsection = parent subsection
 */
export interface OutlineNodeAncestors {
  readonly section: XBlock;
  readonly subsection?: XBlock;
}

/**
 * Require a subsection ancestor at depth 2.
 *
 * Every builder and computation that accesses `ancestors.subsection` at depth 2 must
 * call this guard instead of using `!.` (non-null assertion) or `?.` (optional chaining).
 * This ensures a clear, consistent error message when a unit node is constructed without
 * a parent subsection, rather than a cryptic TypeError.
 */
function requireSubsectionAncestor(ancestors: OutlineNodeAncestors): XBlock {
  if (!ancestors.subsection) {
    throw new Error('outline-level: subsection ancestor required at depth 2');
  }
  return ancestors.subsection;
}

/**
 * Level configuration lookup by depth.
 */
export const LEVEL_CONFIG: Record<Depth, LevelConfig> = {
  0: {
    name: 'section',
    contentClass: 'section-card__content',
    contentTestId: 'section-card__content',
    childContainerClass: 'section-card__subsections',
    childContainerTestId: 'section-card__subsections',
    containerType: ContainerType.Subsection,
    iconSize: 'md',
    background: { padding: '1.75rem' },
  },
  1: {
    name: 'subsection',
    contentClass: 'subsection-card__content item-children',
    contentTestId: 'subsection-card__content',
    childContainerClass: 'subsection-card__units',
    childContainerTestId: 'subsection-card__units',
    containerType: ContainerType.Unit,
    iconSize: 'sm',
    background: { background: '#f8f7f6' },
  },
  2: {
    name: 'unit',
    contentClass: 'unit-card__content item-children',
    contentTestId: 'unit-card__content',
    iconSize: 'xs',
    background: { background: '#fdfdfd' },
  },
};

/**
 * Level names in depth order.
 */
export const LEVEL_NAMES: readonly LevelName[] = ['section', 'subsection', 'unit'];

/**
 * Get level configuration for a given depth.
 */
export function getLevelConfig(depth: Depth): LevelConfig {
  return LEVEL_CONFIG[depth];
}

/**
 * Resolve the effective section for this node.
 *
 * - Depth 0: the block itself
 * - Depth 1, 2: the ancestor section
 */
export function resolveEffectiveSection(
  block: XBlock,
  depth: Depth,
  ancestors: OutlineNodeAncestors,
): XBlock {
  return depth === 0 ? block : ancestors.section;
}

/**
 * Resolve rename target IDs for inline editing.
 *
 * - renameSectionId: always the ancestor section
 * - renameSubsectionId: the block itself at depth 1, ancestor subsection at depth 2
 */
export function resolveRenameIds(
  block: XBlock,
  depth: Depth,
  ancestors: OutlineNodeAncestors,
): { renameSectionId: string; renameSubsectionId?: string; } {
  return {
    renameSectionId: ancestors.section.id,
    renameSubsectionId: depth === 1 ? block.id : depth === 2 ? requireSubsectionAncestor(ancestors).id : undefined,
  };
}

/**
 * Resolve sidebar open arguments for card click.
 */
export function buildSidebarOpenArgs(
  block: XBlock,
  depth: Depth,
  index: number,
  ancestors: OutlineNodeAncestors,
): {
  containerId: string;
  subsectionId?: string;
  sectionId: string;
  index: number;
} {
  switch (depth) {
    case 0:
      return {
        containerId: block.id,
        subsectionId: undefined,
        sectionId: ancestors.section.id,
        index,
      };
    case 1:
      return {
        containerId: block.id,
        subsectionId: block.id,
        sectionId: ancestors.section.id,
        index,
      };
    case 2:
      return {
        containerId: block.id,
        subsectionId: requireSubsectionAncestor(ancestors).id,
        sectionId: ancestors.section.id,
        index,
      };
  }
}

/**
 * Build SelectionState for sidebar "Manage Tags" flow.
 */
export function buildSelectionState(
  block: XBlock,
  depth: Depth,
  index: number,
  ancestors: OutlineNodeAncestors,
): SelectionState {
  switch (depth) {
    case 0:
      return {
        currentId: block.id,
        sectionId: ancestors.section.id,
        index,
      };
    case 1:
      return {
        currentId: block.id,
        subsectionId: block.id,
        sectionId: ancestors.section.id,
        index,
      };
    case 2:
      return {
        currentId: block.id,
        subsectionId: requireSubsectionAncestor(ancestors).id,
        sectionId: ancestors.section.id,
        index,
      };
  }
}

/**
 * Build OutlineActionSelection for configure/delete modals.
 *
 * Returns discriminated union variant based on depth:
 * - Depth 0: 'chapter' (section)
 * - Depth 1: 'sequential' (subsection)
 * - Depth 2: 'vertical' (unit)
 */
export function buildOutlineActionSelection(
  block: XBlock,
  depth: Depth,
  index: number,
  ancestors: OutlineNodeAncestors,
): OutlineActionSelection {
  switch (depth) {
    case 0:
      return {
        category: 'chapter',
        currentId: block.id,
        sectionId: ancestors.section.id,
        index,
      };
    case 1:
      return {
        category: 'sequential',
        currentId: block.id,
        sectionId: ancestors.section.id,
        subsectionId: block.id,
        index,
      };
    case 2:
      return {
        category: 'vertical',
        currentId: block.id,
        sectionId: ancestors.section.id,
        subsectionId: requireSubsectionAncestor(ancestors).id,
        index,
      };
  }
}

/**
 * Payload for publish modal.
 */
export interface PublishModalPayload {
  value: XBlock;
  sectionId: string;
  subsectionId?: string;
}

/**
 * Build publish modal payload.
 */
export function buildPublishPayload(
  liveBlock: XBlock,
  depth: Depth,
  ancestors: OutlineNodeAncestors,
): PublishModalPayload {
  return {
    value: liveBlock,
    sectionId: ancestors.section.id,
    ...(depth >= 2 ? { subsectionId: requireSubsectionAncestor(ancestors).id } : {}),
  };
}

/**
 * Payload for unlink modal.
 */
export interface UnlinkModalPayload {
  value: XBlock;
  sectionId: string;
  subsectionId?: string;
}

/**
 * Build unlink modal payload.
 */
export function buildUnlinkPayload(
  liveBlock: XBlock,
  depth: Depth,
  ancestors: OutlineNodeAncestors,
): UnlinkModalPayload {
  return {
    value: liveBlock,
    sectionId: ancestors.section.id,
    ...(depth >= 2 ? { subsectionId: requireSubsectionAncestor(ancestors).id } : {}),
  };
}

/**
 * Parameters for duplicate mutation.
 */
export interface DuplicateItemParams {
  itemId: string;
  parentId: string;
  sectionId: string;
  subsectionId?: string;
}

/**
 * Build duplicate mutation parameters.
 */
export function buildDuplicateParams(
  block: XBlock,
  depth: Depth,
  courseId: string,
  ancestors: OutlineNodeAncestors,
): DuplicateItemParams {
  const parentId = depth === 0
    ? courseIDtoBlockID(courseId)
    : depth === 1
    ? ancestors.section.id
    : requireSubsectionAncestor(ancestors).id;

  return {
    itemId: block.id,
    parentId,
    sectionId: ancestors.section.id,
    ...(depth >= 1 ?
      {
        subsectionId: depth === 1 ? block.id : requireSubsectionAncestor(ancestors).id,
      } :
      {}),
  };
}

/**
 * Resolve node actions with depth-specific move permissions.
 *
 * - Depth 0: uses canMoveItem for section reordering
 * - Depth 1, 2: uses getPossibleMoves for subsection/unit reordering
 *   - Inhibits moves if direct parent has upstream ref (library sync)
 */
export function resolveNodeActions(
  block: XBlock,
  depth: Depth,
  index: number,
  ancestors: OutlineNodeAncestors,
  canMoveItem?: (oldIndex: number, newIndex: number) => boolean,
  getPossibleMoves?: (index: number, step: number) => MoveDetails | null,
): XBlockActions {
  const actions = { ...block.actions };

  if (depth === 0 && canMoveItem) {
    actions.allowMoveUp = canMoveItem(index, -1);
    actions.allowMoveDown = canMoveItem(index, 1);
  } else if (depth > 0 && getPossibleMoves) {
    const moveUp = getPossibleMoves(index, -1);
    const moveDown = getPossibleMoves(index, 1);

    // Inhibit moves if direct parent has upstream ref (read-only due to library sync)
    const inhibit = depth === 1
      ? ancestors.section.upstreamInfo?.upstreamRef
      : requireSubsectionAncestor(ancestors).upstreamInfo?.upstreamRef;

    actions.allowMoveUp = !isEmpty(moveUp) && !inhibit;
    actions.allowMoveDown = !isEmpty(moveDown) && !inhibit;
    actions.deletable = actions.deletable && !inhibit;
    actions.duplicable = actions.duplicable && !inhibit;
  }

  return actions;
}

/**
 * Compute whether node is draggable.
 *
 * Requires:
 * - actions.draggable = true
 * - allowMoveUp or allowMoveDown = true
 * - Depth 0: always draggable if above conditions met
 * - Depth 1, 2: additionally requires isHeaderVisible and no upstream ref on direct parent
 */
export function computeIsDraggable(
  actions: XBlockActions,
  depth: Depth,
  ancestors: OutlineNodeAncestors,
  isHeaderVisible: boolean,
): boolean {
  const canMove = !!(actions.allowMoveUp || actions.allowMoveDown);
  if (!actions.draggable || !canMove) {
    return false;
  }

  if (depth === 0) {
    return true;
  }

  if (!isHeaderVisible) {
    return false;
  }

  const hasUpstreamRef = depth === 1
    ? ancestors.section.upstreamInfo?.upstreamRef
    : requireSubsectionAncestor(ancestors).upstreamInfo?.upstreamRef;

  return !hasUpstreamRef;
}

/**
 * Compute whether node is droppable (can accept drops).
 */
export function computeIsDroppable(
  actions: XBlockActions,
  depth: Depth,
  ancestors: OutlineNodeAncestors,
): boolean {
  return Boolean(
    actions.draggable
      || actions.childAddable
      || (depth === 1 && ancestors.section.actions?.childAddable)
      || (depth === 2 && requireSubsectionAncestor(ancestors).actions?.childAddable),
  );
}

/**
 * Check if node should render (units with hidden headers don't render).
 */
export function shouldRenderNode(depth: Depth, isHeaderVisible: boolean): boolean {
  return !(depth === 2 && !isHeaderVisible);
}

/**
 * Check if node contains a search result in its descendants.
 *
 * - Depth 2: never (units have no children in outline tree)
 * - Depth 0: checks subsection children and unit grandchildren
 * - Depth 1: checks unit children
 */
export function containsSearchResult(
  block: XBlock,
  depth: Depth,
  locatorId: string | null,
): boolean {
  if (!locatorId || depth === 2) {
    return false;
  }

  if (depth === 0) {
    const subs = block.childInfo?.children ?? [];
    return subs.some(
      (sub: any) =>
        sub.id === locatorId
        || sub.childInfo?.children?.some((u: any) => u.id === locatorId),
    );
  }

  return block.childInfo?.children?.some((u: any) => u.id === locatorId) ?? false;
}

/**
 * Parameters for creating an outline node model.
 */
export interface OutlineNodeModelParams {
  block: XBlock;
  depth: Depth;
  index: number;
  ancestors: OutlineNodeAncestors;
  courseId?: string;
  canMoveItem?: (oldIndex: number, newIndex: number) => boolean;
  getPossibleMoves?: (index: number, step: number) => MoveDetails | null;
}

/**
 * Create a bound model for an outline node with all builders pre-configured.
 *
 * Convenience wrapper that returns an object with all builders and resolvers
 * bound to the given node context. Useful for reducing parameter passing in JSX.
 */
export function createOutlineNodeModel(params: OutlineNodeModelParams) {
  const { block, depth, index, ancestors, courseId, canMoveItem, getPossibleMoves } = params;

  // Validate ancestor invariants
  if (depth >= 2 && !ancestors.subsection) {
    throw new Error(`outline-level: subsection ancestor required at depth ${depth}`);
  }

  const levelConfig = getLevelConfig(depth);

  return {
    levelConfig,

    effectiveSection: resolveEffectiveSection(block, depth, ancestors),

    ...resolveRenameIds(block, depth, ancestors),

    selectionState: () => buildSelectionState(block, depth, index, ancestors),
    actionSelection: () => buildOutlineActionSelection(block, depth, index, ancestors),
    sidebarOpenArgs: () => buildSidebarOpenArgs(block, depth, index, ancestors),
    publishPayload: (liveBlock: XBlock) => buildPublishPayload(liveBlock, depth, ancestors),
    unlinkPayload: (liveBlock: XBlock) => buildUnlinkPayload(liveBlock, depth, ancestors),
    duplicateParams: () => buildDuplicateParams(block, depth, courseId!, ancestors),

    actions: () => resolveNodeActions(block, depth, index, ancestors, canMoveItem, getPossibleMoves),
    isDraggable: (resolvedActions: XBlockActions, isHeaderVisible: boolean) =>
      computeIsDraggable(resolvedActions, depth, ancestors, isHeaderVisible),
    isDroppable: (resolvedActions: XBlockActions) => computeIsDroppable(resolvedActions, depth, ancestors),
    shouldRender: (isHeaderVisible: boolean) => shouldRenderNode(depth, isHeaderVisible),
    containsSearchResult: (locatorId: string | null) => containsSearchResult(block, depth, locatorId),
  };
}
