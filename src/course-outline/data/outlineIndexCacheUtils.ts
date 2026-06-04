import { getBlockType } from '@src/generic/key-utils';
import type { XBlock, XBlockBase } from '@src/data/types';
import { courseOutlineIndexQueryKey } from './outlineIndexQuery';
import type { QueryClient } from '@tanstack/react-query';

/** Append a new section to outline index query cache. */
export const appendSectionToOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  newSection: XBlockBase,
) => {
  queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
    if (!old) { return old; }
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: {
          ...(old.courseStructure.childInfo || { children: [] }),
          children: [...(old.courseStructure.childInfo?.children || []), newSection],
        },
      },
    };
  });
};

/** Replace top-level sections in outline index cache by id. */
export const replaceSectionInOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  sections: Record<string, XBlock>,
) => {
  const old = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId)) as any;
  if (!old?.courseStructure?.childInfo?.children) { return; }
  let hadMissingChildInfo = false;
  const updated = {
    ...old,
    courseStructure: {
      ...old.courseStructure,
      childInfo: {
        ...old.courseStructure.childInfo,
        children: old.courseStructure.childInfo.children.map(
          (s: any) => {
            if (!(s.id in sections)) { return s; }
            const replacement = sections[s.id];
            // Skip replacement if missing childInfo.children, invalidate as fallback
            if (!replacement?.childInfo?.children) {
              hadMissingChildInfo = true;
              return s;
            }
            return replacement;
          },
        ),
      },
    },
  };
  queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), updated);
  if (hadMissingChildInfo) {
    queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
  }
};

/**
 * Map over top-level section children in the outline tree.
 */
function mapSections(tree: any, fn: (section: any) => any): any {
  return {
    ...tree,
    courseStructure: {
      ...tree.courseStructure,
      childInfo: {
        ...tree.courseStructure.childInfo,
        children: tree.courseStructure.childInfo.children.map(fn),
      },
    },
  };
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
  const children = old.courseStructure.childInfo.children;

  if (category === 'chapter') {
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: { ...old.courseStructure.childInfo, children: children.filter((s: any) => s.id !== itemId) },
      },
    };
  }

  if (category === 'sequential') {
    return mapSections(old, (s: any) =>
      s.id !== variables.sectionId ? s : {
        ...s,
        childInfo: {
          ...s.childInfo,
          children: (s.childInfo?.children || []).filter((sub: any) => sub.id !== itemId),
        },
      },
    );
  }

  if (category === 'vertical') {
    return mapSections(old, (s: any) =>
      s.id !== variables.sectionId ? s : {
        ...s,
        childInfo: {
          ...s.childInfo,
          children: (s.childInfo?.children || []).map((sub: any) =>
            sub.id !== variables.subsectionId ? sub : {
              ...sub,
              childInfo: {
                ...sub.childInfo,
                children: (sub.childInfo?.children || []).filter((u: any) => u.id !== itemId),
              },
            }
          ),
        },
      },
    );
  }

  return old;
}

/** Insert duplicated section after original id in outline index cache. */
export const insertDuplicatedSectionInOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  originalId: string,
  duplicatedSection: XBlockBase,
) => {
  queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
    if (!old?.courseStructure?.childInfo?.children) { return old; }
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: {
          ...old.courseStructure.childInfo,
          children: old.courseStructure.childInfo.children.reduce(
            (result: any[], current: any) => {
              if (current.id === originalId) {
                return [...result, current, duplicatedSection];
              }
              return [...result, current];
            },
            [],
          ),
        },
      },
    };
  });
};
