import { useCallback } from 'react';
import type { OutlineActionSelection } from '@src/data/types';
import {
  useDeleteCourseItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  type ConfigureItemPayload,
} from '../data';

// ─── Narrow hook: delete only ────────────────────────────────────────────

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

  return { handleDeleteItemSubmit };
}

// ─── Narrow hook: configure only ─────────────────────────────────────────

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
          default:
            throw new Error(`Unrecognized category`);
        }
        return true;
      } catch {
        return false;
      }
    },
    [configureSectionMutation, configureSubsectionMutation, configureUnitMutation],
  );

  return { handleConfigureItemSubmit };
}
