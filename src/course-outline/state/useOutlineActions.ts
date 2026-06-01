import { useCallback } from 'react';
import { getBlockType } from '@src/generic/key-utils';
import { SelectionState } from '@src/data/types';
import {
  useDeleteCourseItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
} from '../data/apiHooks';

export interface OutlineActions {
  /** Returns true on success, false on failure. Caller handles modal close + selection clear. */
  handleDeleteItemSubmit: (selection: SelectionState) => Promise<boolean>;
  handleConfigureItemSubmit: (selection: SelectionState, variables: Record<string, unknown>) => void;
}

/**
 * Narrow hook for delete + configure mutation coordination.
 * Accepts explicit SelectionState inputs — does NOT read from any context.
 */
export function useOutlineActions(courseId: string): OutlineActions {
  const deleteMutation = useDeleteCourseItem(courseId);
  const configureSectionMutation = useConfigureSection(courseId);
  const configureSubsectionMutation = useConfigureSubsection(courseId);
  const configureUnitMutation = useConfigureUnit(courseId);

  const handleDeleteItemSubmit = useCallback(async (selection: SelectionState): Promise<boolean> => {
    if (!selection?.currentId) {
      return false;
    }
    try {
      const category = getBlockType(selection.currentId);
      switch (category) {
        case 'chapter':
          await deleteMutation.mutateAsync({ itemId: selection.currentId });
          break;
        case 'sequential':
          await deleteMutation.mutateAsync({
            itemId: selection.currentId,
            sectionId: selection.sectionId!,
          });
          break;
        case 'vertical':
          await deleteMutation.mutateAsync({
            itemId: selection.currentId,
            subsectionId: selection.subsectionId!,
            sectionId: selection.sectionId!,
          });
          break;
        default:
          throw new Error(`Unrecognized category ${category}`);
      }
      return true;
    } catch {
      return false;
    }
  }, [deleteMutation]);

  const handleConfigureItemSubmit = useCallback((
    selection: SelectionState,
    variables: Record<string, unknown>,
  ) => {
    if (!selection?.currentId) {
      return;
    }
    const category = getBlockType(selection.currentId);
    switch (category) {
      case 'chapter':
        configureSectionMutation.mutate({ sectionId: selection.sectionId!, ...variables } as Parameters<typeof configureSectionMutation.mutate>[0]);
        break;
      case 'sequential':
        configureSubsectionMutation.mutate({
          itemId: selection.currentId,
          sectionId: selection.sectionId!,
          ...variables,
        });
        break;
      case 'vertical':
        configureUnitMutation.mutate({
          unitId: selection.currentId!,
          sectionId: selection.sectionId!,
          ...variables,
        } as Parameters<typeof configureUnitMutation.mutate>[0]);
        break;
      default:
        throw new Error('Unsupported block type');
    }
  }, [configureSectionMutation, configureSubsectionMutation, configureUnitMutation]);

  return { handleDeleteItemSubmit, handleConfigureItemSubmit };
}
