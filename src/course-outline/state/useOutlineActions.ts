import { useCallback } from 'react';
import type { OutlineActionSelection } from '@src/data/types';
import type { ConfigureItemPayload } from '../data/types';
import {
  useDeleteCourseItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
} from '../data/apiHooks';

export interface OutlineActions {
  /** Returns true on success, false on failure. Caller handles modal close + selection clear. */
  handleDeleteItemSubmit: (selection: OutlineActionSelection) => Promise<boolean>;
  /** Returns true on success, false on failure. Caller handles modal close + data cleanup. */
  handleConfigureItemSubmit: (payload: ConfigureItemPayload) => Promise<boolean>;
}

/**
 * Narrow hook for delete + configure mutation coordination.
 * Accepts explicit OutlineActionSelection/ConfigureItemPayload inputs
 * (category-discriminated) — does NOT read from any context or call getBlockType.
 */
export function useOutlineActions(_courseId: string): OutlineActions {
  const deleteMutation = useDeleteCourseItem(_courseId);
  const configureSectionMutation = useConfigureSection(_courseId);
  const configureSubsectionMutation = useConfigureSubsection(_courseId);
  const configureUnitMutation = useConfigureUnit(_courseId);

  const handleDeleteItemSubmit = useCallback(
    async (selection: OutlineActionSelection): Promise<boolean> => {
      try {
        switch (selection.category) {
          case 'chapter':
            await deleteMutation.mutateAsync({ itemId: selection.currentId });
            break;
          case 'sequential':
            await deleteMutation.mutateAsync({
              itemId: selection.currentId,
              sectionId: selection.sectionId,
            });
            break;
          case 'vertical':
            await deleteMutation.mutateAsync({
              itemId: selection.currentId,
              subsectionId: selection.subsectionId,
              sectionId: selection.sectionId,
            });
            break;
          default:
            throw new Error(`Unrecognized category`);
        }
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation],
  );

  const handleConfigureItemSubmit = useCallback(
    async (payload: ConfigureItemPayload): Promise<boolean> => {
      if (!payload) { return false; }
      try {
        switch (payload.category) {
          case 'chapter': {
            const { category: _, ...rest } = payload;
            await configureSectionMutation.mutateAsync(rest);
            break;
          }
          case 'sequential': {
            const { category: _, ...rest } = payload;
            await configureSubsectionMutation.mutateAsync(rest);
            break;
          }
          case 'vertical': {
            const { category: _, ...rest } = payload;
            await configureUnitMutation.mutateAsync(rest);
            break;
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    [configureSectionMutation, configureSubsectionMutation, configureUnitMutation],
  );

  return { handleDeleteItemSubmit, handleConfigureItemSubmit };
}
