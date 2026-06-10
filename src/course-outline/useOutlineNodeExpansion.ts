import { useEffect, useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { XBlock } from '@src/data/types';
import type { Depth } from './outline-level';
import { containsSearchResult } from './outline-level';

type ScrollState = {
  id?: string;
};

interface UseOutlineNodeExpansionParams {
  depth: Depth;
  block: XBlock;
  locatorId: string | null;
  isSectionsExpanded: boolean;
  isHeaderVisible: boolean;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  scrollState: ScrollState | null | undefined;
}

interface UseOutlineNodeExpansionResult {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Manages expansion state for outline nodes with automatic expansion for:
 * - Search results in descendants
 * - Drag-and-drop interactions
 * - Scroll-to-element navigation
 * - Bulk expand/collapse via isSectionsExpanded prop
 *
 * Expansion only applies to depth 0 (sections) and depth 1 (subsections).
 * Depth 2 (units) never expand as they have no children in the outline tree.
 */
export function useOutlineNodeExpansion({
  depth,
  block,
  locatorId,
  isSectionsExpanded,
  isHeaderVisible,
  activeId,
  overId,
  scrollState,
}: UseOutlineNodeExpansionParams): UseOutlineNodeExpansionResult {
  const hasSearchMatch = containsSearchResult(block, depth, locatorId);

  const [isExpanded, setIsExpanded] = useState(
    depth < 2 && (hasSearchMatch || (depth === 0 ? isSectionsExpanded : (!isHeaderVisible || isSectionsExpanded))),
  );

  // Sync with isSectionsExpanded prop
  useEffect(() => {
    if (depth < 2) { setIsExpanded(isSectionsExpanded); }
  }, [isSectionsExpanded, depth]);

  // Drag state: collapse when dragging this node, expand when dragging over it
  useEffect(() => {
    if (depth < 2) {
      if (activeId === block.id && isExpanded) { setIsExpanded(false); }
      else if (overId === block.id && !isExpanded) { setIsExpanded(true); }
    }
  }, [activeId, overId, block.id, isExpanded, depth]);

  // Expand when search result appears in descendants
  useEffect(() => {
    if (depth < 2 && locatorId) { setIsExpanded((prev) => hasSearchMatch || prev); }
  }, [locatorId, hasSearchMatch, depth, block.childInfo]);

  // Expand when scroll target is in descendants (depth 0 only)
  useEffect(() => {
    if (depth !== 0 || !scrollState?.id) { return; }
    if (containsSearchResult(block, depth, scrollState.id)) { setIsExpanded(true); }
  }, [scrollState?.id, block.childInfo, depth]);

  return {
    isExpanded,
    setIsExpanded,
  };
}
