import { renderHook, act } from '@testing-library/react';
import type { XBlock } from '@src/data/types';
import { useOutlineNodeExpansion } from './useOutlineNodeExpansion';
import type { Depth } from './outline-level';

describe('useOutlineNodeExpansion', () => {
  const createMockBlock = (id: string, children: any[] = []): XBlock => ({
    id,
    category: 'chapter',
    childInfo: { children },
  } as any);

  const defaultParams = {
    depth: 0 as Depth,
    block: createMockBlock('section-1'),
    locatorId: null,
    isSectionsExpanded: true,
    isHeaderVisible: true,
    activeId: null,
    overId: null,
    scrollState: undefined,
  };

  describe('initial state', () => {
    it('should be expanded when isSectionsExpanded is true at depth 0', () => {
      const { result } = renderHook(() => useOutlineNodeExpansion(defaultParams));
      expect(result.current.isExpanded).toBe(true);
    });

    it('should be collapsed when isSectionsExpanded is false at depth 0', () => {
      const { result } = renderHook(() => useOutlineNodeExpansion({ ...defaultParams, isSectionsExpanded: false }));
      expect(result.current.isExpanded).toBe(false);
    });

    it('depth 1: hidden header does NOT stay expanded when isSectionsExpanded=false after effects', () => {
      const { result } = renderHook(() =>
        useOutlineNodeExpansion({ ...defaultParams, depth: 1, isHeaderVisible: false, isSectionsExpanded: false })
      );
      // Initial state is true (hidden header logic in useState), but sync effect collapses it
      expect(result.current.isExpanded).toBe(false);
    });

    it('depth 0: hidden header does NOT force expansion when sections collapsed', () => {
      const { result } = renderHook(() =>
        useOutlineNodeExpansion({ ...defaultParams, depth: 0, isHeaderVisible: false, isSectionsExpanded: false })
      );
      expect(result.current.isExpanded).toBe(false);
    });

    it('should never expand at depth 2', () => {
      const { result } = renderHook(() => useOutlineNodeExpansion({ ...defaultParams, depth: 2 }));
      expect(result.current.isExpanded).toBe(false);
    });

    it('should expand initially when search result is in descendants', () => {
      const blockWithChild = createMockBlock('section-1', [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ]);
      const { result } = renderHook(() =>
        useOutlineNodeExpansion({
          ...defaultParams,
          block: blockWithChild,
          locatorId: 'unit-1',
          isSectionsExpanded: false,
        })
      );
      expect(result.current.isExpanded).toBe(true);
    });
  });

  describe('search result expansion', () => {
    it('should expand when locatorId matches a descendant at depth 0', () => {
      const blockWithChild = createMockBlock('section-1', [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ]);
      const { result, rerender } = renderHook(
        ({ locatorId }: { locatorId: string | null; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            block: blockWithChild,
            locatorId,
            isSectionsExpanded: false,
          }),
        { initialProps: { locatorId: null } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ locatorId: 'unit-1' });
      expect(result.current.isExpanded).toBe(true);
    });

    it('should expand when locatorId matches a child at depth 1', () => {
      const blockWithChild = createMockBlock('subsection-1', [
        createMockBlock('unit-1'),
      ]);
      const { result, rerender } = renderHook(
        ({ locatorId }: { locatorId: string | null; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            depth: 1,
            block: blockWithChild,
            locatorId,
            isSectionsExpanded: false,
          }),
        { initialProps: { locatorId: null } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ locatorId: 'unit-1' });
      expect(result.current.isExpanded).toBe(true);
    });

    it('should not check descendants at depth 2', () => {
      const blockWithChild = createMockBlock('unit-1', [
        createMockBlock('component-1'),
      ]);
      const { result } = renderHook(() =>
        useOutlineNodeExpansion({
          ...defaultParams,
          depth: 2,
          block: blockWithChild,
          locatorId: 'component-1',
        })
      );
      expect(result.current.isExpanded).toBe(false);
    });
  });

  describe('drag state management', () => {
    it('should collapse when node is being dragged', () => {
      const { result, rerender } = renderHook(
        ({ activeId }: { activeId: string | null; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            activeId,
          }),
        { initialProps: { activeId: null } },
      );

      expect(result.current.isExpanded).toBe(true);

      rerender({ activeId: 'section-1' });
      expect(result.current.isExpanded).toBe(false);
    });

    it('should expand when dragging over the node', () => {
      const { result, rerender } = renderHook(
        ({ overId, isSectionsExpanded }: { overId: string | null; isSectionsExpanded: boolean; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            overId,
            isSectionsExpanded,
          }),
        { initialProps: { overId: null, isSectionsExpanded: false } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ overId: 'section-1', isSectionsExpanded: false });
      expect(result.current.isExpanded).toBe(true);
    });

    it('should not affect expansion at depth 2', () => {
      const { result, rerender } = renderHook(
        ({ activeId }: { activeId: string | null; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            depth: 2,
            activeId,
          }),
        { initialProps: { activeId: null } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ activeId: 'unit-1' });
      expect(result.current.isExpanded).toBe(false);
    });
  });

  describe('scroll state expansion', () => {
    it('should expand when scroll target is a descendant at depth 0', () => {
      const blockWithChild = createMockBlock('section-1', [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ]);
      const { result, rerender } = renderHook(
        ({ scrollState }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            block: blockWithChild,
            scrollState,
            isSectionsExpanded: false,
          }),
        { initialProps: { scrollState: undefined as any } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ scrollState: { id: 'unit-1' } });
      expect(result.current.isExpanded).toBe(true);
    });

    it('should not expand for scroll state at depth > 0', () => {
      const blockWithChild = createMockBlock('subsection-1', [
        createMockBlock('unit-1'),
      ]);
      const { result, rerender } = renderHook(
        ({ scrollState }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            depth: 1,
            block: blockWithChild,
            scrollState,
            isSectionsExpanded: false,
          }),
        { initialProps: { scrollState: undefined as any } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ scrollState: { id: 'unit-1' } });
      expect(result.current.isExpanded).toBe(false);
    });

    it('should not collapse when scroll target is in a collapsed node (scroll only expands)', () => {
      const blockWithChild = createMockBlock('section-1', [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ]);
      const { result, rerender } = renderHook(
        ({ scrollState }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            block: blockWithChild,
            scrollState,
            isSectionsExpanded: false,
          }),
        { initialProps: { scrollState: { id: 'unit-1' } } },
      );

      // Starts expanded because unit-1 is a descendant
      expect(result.current.isExpanded).toBe(true);

      // Removing scroll target should NOT collapse (scroll only expands, never collapses)
      rerender({ scrollState: undefined as any });
      expect(result.current.isExpanded).toBe(true);
    });
  });

  describe('isSectionsExpanded sync', () => {
    it('should sync expansion state with isSectionsExpanded prop', () => {
      const { result, rerender } = renderHook(
        ({ isSectionsExpanded }: { isSectionsExpanded: boolean; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            isSectionsExpanded,
          }),
        { initialProps: { isSectionsExpanded: true } },
      );

      expect(result.current.isExpanded).toBe(true);

      rerender({ isSectionsExpanded: false });
      expect(result.current.isExpanded).toBe(false);

      rerender({ isSectionsExpanded: true });
      expect(result.current.isExpanded).toBe(true);
    });

    it('should not sync at depth 2', () => {
      const { result, rerender } = renderHook(
        ({ isSectionsExpanded }: { isSectionsExpanded: boolean; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            depth: 2,
            isSectionsExpanded,
          }),
        { initialProps: { isSectionsExpanded: true } },
      );

      expect(result.current.isExpanded).toBe(false);

      rerender({ isSectionsExpanded: false });
      expect(result.current.isExpanded).toBe(false);
    });
  });

  describe('effect conflicts', () => {
    it('locator/search can re-expand after isSectionsExpanded=false', () => {
      const blockWithChild = createMockBlock('section-1', [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ]);
      const { result, rerender } = renderHook(
        ({ isSectionsExpanded, locatorId }: { isSectionsExpanded: boolean; locatorId: string | null; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            block: blockWithChild,
            isSectionsExpanded,
            locatorId,
          }),
        { initialProps: { isSectionsExpanded: true, locatorId: null } },
      );

      // Initially expanded
      expect(result.current.isExpanded).toBe(true);

      // Collapse via isSectionsExpanded
      rerender({ isSectionsExpanded: false, locatorId: null });
      expect(result.current.isExpanded).toBe(false);

      // Search can re-expand
      rerender({ isSectionsExpanded: false, locatorId: 'unit-1' });
      expect(result.current.isExpanded).toBe(true);
    });

    it('re-expands when block.childInfo refreshes after manual collapse', () => {
      const baseChildren = [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ];
      const blockWithChild = createMockBlock('section-1', baseChildren);
      let { result, rerender } = renderHook(
        ({ block, locatorId }: { block: XBlock; locatorId: string | null; }) =>
          useOutlineNodeExpansion({
            ...defaultParams,
            block,
            locatorId,
            isSectionsExpanded: false,
          }),
        { initialProps: { block: blockWithChild, locatorId: 'unit-1' } },
      );

      // Expanded because locatorId matches
      expect(result.current.isExpanded).toBe(true);

      // User manually collapses
      act(() => {
        result.current.setIsExpanded(false);
      });
      expect(result.current.isExpanded).toBe(false);

      // Simulate refetch: new block reference with same matching structure
      const refreshedBlock = createMockBlock('section-1', [
        createMockBlock('subsection-1', [createMockBlock('unit-1')]),
      ]);
      rerender({ block: refreshedBlock, locatorId: 'unit-1' });

      // Should re-expand because search effect fires on childInfo change
      expect(result.current.isExpanded).toBe(true);
    });
  });
});
