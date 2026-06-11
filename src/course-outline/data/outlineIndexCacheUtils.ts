import { getBlockType } from '@src/generic/key-utils';
import type { XBlock, XBlockBase } from '@src/data/types';
import { courseOutlineQueryKeys } from './queryKeys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Pure helper: apply a transformation to the top-level children
 * of the outline-index tree structure, preserving the 4-level
 * immutable spread pattern that every cache-util function needs.
 *
 * Callers must guard against null/undefined `old` before calling.
 */
function updateCourseStructure(
  old: any,
  transformChildren: (children: any[]) => any[],
): any {
  return {
    ...old,
    courseStructure: {
      ...old.courseStructure,
      childInfo: {
        ...(old.courseStructure.childInfo || { children: [] }),
        children: transformChildren(old.courseStructure.childInfo?.children || []),
      },
    },
  };
}

/** Append a new section to outline index query cache. */
export const appendSectionToOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  newSection: XBlockBase,
) => {
  queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), (old: any) => {
    if (!old) { return old; }
    return updateCourseStructure(old, (children) => [...children, newSection]);
  });
};

/** Replace top-level sections in outline index cache by id. */
export const replaceSectionInOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  sections: Record<string, XBlock>,
) => {
  const old = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId)) as any;
  if (!old?.courseStructure?.childInfo?.children) { return; }
  let hadMissingChildInfo = false;
  const updated = updateCourseStructure(old, (children) =>
    children.map((s: any) => {
      if (!(s.id in sections)) { return s; }
      const replacement = sections[s.id];
      // Skip replacement if missing childInfo.children, invalidate as fallback
      if (!replacement?.childInfo?.children) {
        hadMissingChildInfo = true;
        return s;
      }
      return replacement;
    }));
  queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), updated);
  if (hadMissingChildInfo) {
    queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.index(courseId) });
  }
};

/**
 * Map over top-level section children in the outline tree.
 * Delegates to updateCourseStructure.
 */
function mapSections(tree: any, fn: (section: any) => any): any {
  return updateCourseStructure(tree, (children) => children.map(fn));
}

/**
 * Pure function: remove an item from outline-index data and return new tree.
 * Does not touch React Query cache. Caller wraps with setQueryData.
 */
export function removeItemFromOutlineIndexData(
  old: any,
  itemId: string,
  variables: { sectionId?: string; subsectionId?: string; },
): any {
  if (!old?.courseStructure?.childInfo?.children) { return old; }
  const category = getBlockType(itemId);

  const removeHandlers: Record<string, (o: any, id: string, v: typeof variables) => any> = {
    chapter: (o, id) =>
      updateCourseStructure(o, () => o.courseStructure.childInfo.children.filter((s: any) => s.id !== id)),
    sequential: (o, id, v) =>
      mapSections(o, (s: any) =>
        s.id !== v.sectionId ? s : {
          ...s,
          childInfo: {
            ...s.childInfo,
            children: (s.childInfo?.children || []).filter((sub: any) => sub.id !== id),
          },
        }),
    vertical: (o, id, v) =>
      mapSections(o, (s: any) =>
        s.id !== v.sectionId ? s : {
          ...s,
          childInfo: {
            ...s.childInfo,
            children: (s.childInfo?.children || []).map((sub: any) =>
              sub.id !== v.subsectionId ? sub : {
                ...sub,
                childInfo: {
                  ...sub.childInfo,
                  children: (sub.childInfo?.children || []).filter((u: any) => u.id !== id),
                },
              }
            ),
          },
        }),
  };

  const handler = removeHandlers[category];
  return handler ? handler(old, itemId, variables) : old;
}

/**
 * Recursively find an item by id in a node tree and apply an updater function.
 * Returns new tree with the matching item replaced.
 */
function updateNodeInTree(
  node: any,
  itemId: string,
  updater: (node: any) => any,
): any {
  if (!node) { return node; }

  if (node.id === itemId) {
    return updater(node);
  }

  if (node.childInfo?.children) {
    return {
      ...node,
      childInfo: {
        ...node.childInfo,
        children: node.childInfo.children.map((child: any) =>
          updateNodeInTree(child, itemId, updater),
        ),
      },
    };
  }

  return node;
}

/**
 * Update a node in the outline-index tree cache by id using an updater function.
 * Recursively traverses the tree to find the item and applies updater to it.
 */
export function updateNodeInOutlineIndex(
  queryClient: QueryClient,
  courseId: string,
  itemId: string,
  updater: (node: any) => any,
): void {
  queryClient.setQueryData(
    courseOutlineQueryKeys.index(courseId),
    (old: any) => {
      if (!old?.courseStructure) { return old; }
      return {
        ...old,
        courseStructure: updateNodeInTree(old.courseStructure, itemId, updater),
      };
    },
  );
}

/** Insert duplicated section after original id in outline index cache. */
export const insertDuplicatedSectionInOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  originalId: string,
  duplicatedSection: XBlockBase,
) => {
  queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), (old: any) => {
    if (!old?.courseStructure?.childInfo?.children) { return old; }
    return updateCourseStructure(old, (children) =>
      children.reduce(
        (result: any[], current: any) => {
          if (current.id === originalId) {
            return [...result, current, duplicatedSection];
          }
          return [...result, current];
        },
        [],
      ));
  });
};
