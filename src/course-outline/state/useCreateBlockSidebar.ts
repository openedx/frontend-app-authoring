import { useCallback } from 'react';
import { ContainerType } from '@src/generic/key-utils';
import { useCreateCourseBlock } from '@src/course-outline/data/apiHooks';
import { COURSE_BLOCK_NAMES } from '../constants';

/**
 * Shared hook for creating section and subsection blocks and opening the info sidebar.
 *
 * Encapsulates the common mutateAsync → openContainerInfoSidebar flow used by
 * both OutlineAddChildButtons and AddSidebar's AddContentButton.
 */
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

  const createSection = useCallback(async (
    onSuccess?: (data: { locator: string }) => void,
  ) => {
    const data = await handleAddBlock.mutateAsync({
      type: ContainerType.Chapter,
      parentLocator: courseUsageKey,
      displayName: COURSE_BLOCK_NAMES.chapter.name,
    });
    if (onSuccess) {
      onSuccess(data);
    } else {
      openContainerInfoSidebar(data.locator, undefined, data.locator);
    }
    return data;
  }, [handleAddBlock, courseUsageKey, openContainerInfoSidebar]);

  const createSubsection = useCallback(async (
    sectionId: string,
    onSuccess?: (data: { locator: string }) => void,
  ) => {
    const data = await handleAddBlock.mutateAsync({
      type: ContainerType.Sequential,
      parentLocator: sectionId,
      displayName: COURSE_BLOCK_NAMES.sequential.name,
      sectionId,
    });
    if (onSuccess) {
      onSuccess(data);
    } else {
      openContainerInfoSidebar(data.locator, data.locator, sectionId);
    }
    return data;
  }, [handleAddBlock, openContainerInfoSidebar]);

  return { createSection, createSubsection, handleAddBlock };
}
