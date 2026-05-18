import { useCallback } from 'react';
import { useDuplicateItem } from '../data/apiHooks';
import { courseIDtoBlockID } from '../utils';

export interface UseOutlineDuplicateOutput {
  duplicateSection: (itemId: string, sectionId: string) => void;
  duplicateSubsection: (itemId: string, sectionId: string, subsectionId?: string) => void;
  duplicateUnit: (itemId: string, sectionId: string, subsectionId: string) => void;
  isPending: boolean;
}

/**
 * Provides duplicate handlers for sections, subsections, and units.
 *
 * Each handler encodes the correct parentLocator for the block type:
 * - sections → parentLocator = courseIDtoBlockID(courseId)
 * - subsections → parentLocator = sectionId
 * - units → parentLocator = subsectionId
 */
const useOutlineDuplicate = (courseId: string): UseOutlineDuplicateOutput => {
  const duplicateMutation = useDuplicateItem(courseId);

  const duplicateSection = useCallback((itemId: string, sectionId: string) => {
    duplicateMutation.mutate({ itemId, parentId: courseIDtoBlockID(courseId), sectionId });
  }, [duplicateMutation, courseId]);

  const duplicateSubsection = useCallback((itemId: string, sectionId: string, subsectionId?: string) => {
    duplicateMutation.mutate({ itemId, parentId: sectionId, sectionId, subsectionId });
  }, [duplicateMutation]);

  const duplicateUnit = useCallback((itemId: string, sectionId: string, subsectionId: string) => {
    duplicateMutation.mutate({ itemId, parentId: subsectionId, sectionId, subsectionId });
  }, [duplicateMutation]);

  return {
    duplicateSection,
    duplicateSubsection,
    duplicateUnit,
    isPending: duplicateMutation.isPending,
  };
};

export default useOutlineDuplicate;
