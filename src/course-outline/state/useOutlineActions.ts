import { useCallback } from 'react';
import type { OutlineActionSelection } from '@src/data/types';
import {
  useDeleteCourseItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  type ConfigureItemPayload,
} from '../data';
import { OUTLINE_CATEGORY_CONFIG } from '../constants';

/**
 * Narrow hook for delete mutation coordination.
 * Registers only useDeleteCourseItem — avoids registering configure mutations.
 */
export function useOutlineDeleteAction(courseId: string): {
  handleDeleteItemSubmit: (selection: OutlineActionSelection) => Promise<boolean>;
} {
  const deleteMutation = useDeleteCourseItem(courseId);

  const handleDeleteItemSubmit = useCallback(
    async (selection: OutlineActionSelection): Promise<boolean> => {
      try {
        const config = OUTLINE_CATEGORY_CONFIG[selection.category];
        const deleteParams: Record<string, string> = { itemId: selection.currentId };
        for (const field of config.deleteExtraFields) {
          deleteParams[field] = (selection as any)[field];
        }
        await deleteMutation.mutateAsync(deleteParams as Parameters<typeof deleteMutation.mutateAsync>[0]);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation],
  );

  return { handleDeleteItemSubmit };
}

/**
 * Narrow hook for configure mutation coordination.
 * Registers only configure mutations (section/subsection/unit) — avoids registering delete.
 */
export function useOutlineConfigureAction(courseId: string): {
  handleConfigureItemSubmit: (payload: ConfigureItemPayload) => Promise<boolean>;
} {
  const configureSectionMutation = useConfigureSection(courseId);
  const configureSubsectionMutation = useConfigureSubsection(courseId);
  const configureUnitMutation = useConfigureUnit(courseId);

  const configureMutationMap = {
    chapter: configureSectionMutation,
    sequential: configureSubsectionMutation,
    vertical: configureUnitMutation,
  } as const;

  const handleConfigureItemSubmit = useCallback(
    async (payload: ConfigureItemPayload): Promise<boolean> => {
      if (!payload) { return false; }
      try {
        const { category: _, ...rest } = payload;
        await configureMutationMap[payload.category].mutateAsync(rest as any);
        return true;
      } catch {
        return false;
      }
    },
    [configureSectionMutation, configureSubsectionMutation, configureUnitMutation],
  );

  return { handleConfigureItemSubmit };
}
