import { useCallback } from 'react';
import { ContainerType } from '@src/generic/key-utils';
import type { ParentIds } from '@src/generic/types';
import { useCreateCourseBlock } from '@src/course-outline/data/apiHooks';
import type { CreateCourseXBlockType } from '@src/course-outline/data/api';
import { COURSE_BLOCK_NAMES } from '../constants';

type SidebarResolver =
  | string
  | ((data: { locator: string; }) => string | undefined);

function resolveSidebarValue(
  resolver: SidebarResolver | undefined,
  data: { locator: string; },
): string | undefined {
  if (typeof resolver === 'function') {
    return resolver(data);
  }
  return resolver;
}

export function useCreateBlockSidebar(
  courseId: string,
  courseUsageKey: string,
  openContainerInfoSidebar: (
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => void,
) {
  const handleAddBlock = useCreateCourseBlock(courseId);

  const createBlock = useCallback(async (
    payload: CreateCourseXBlockType & ParentIds,
    onSuccess?: (data: { locator: string; }) => void,
    sidebarSectionId?: SidebarResolver,
    sidebarSubsectionId?: SidebarResolver,
  ) => {
    const data = await handleAddBlock.mutateAsync(payload);
    if (onSuccess) {
      onSuccess(data);
      return data;
    }
    openContainerInfoSidebar(
      data.locator,
      resolveSidebarValue(sidebarSubsectionId, data),
      resolveSidebarValue(sidebarSectionId, data) ?? data.locator,
    );
    return data;
  }, [handleAddBlock, openContainerInfoSidebar]);

  const createSection = useCallback(async (
    onSuccess?: (data: { locator: string; }) => void,
  ) =>
    createBlock(
      {
        type: ContainerType.Chapter,
        parentLocator: courseUsageKey,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      },
      onSuccess,
    ), [createBlock, courseUsageKey]);

  const createSubsection = useCallback(async (
    sectionId: string,
    onSuccess?: (data: { locator: string; }) => void,
  ) =>
    createBlock(
      {
        type: ContainerType.Sequential,
        parentLocator: sectionId,
        displayName: COURSE_BLOCK_NAMES.sequential.name,
        sectionId,
      },
      onSuccess,
      sectionId,
      (data) => data.locator,
    ), [createBlock]);

  return { createSection, createSubsection, handleAddBlock };
}
