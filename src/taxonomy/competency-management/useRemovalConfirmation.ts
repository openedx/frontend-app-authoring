import { useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQueryClient } from '@tanstack/react-query';

import type { CourseOutline } from '@src/course-outline/data';
// Bypasses the public barrel for the same reason the provider does: this is
// the key its outline fetches are cached under.
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import { useToastContext } from '@src/generic/toast-context';

import type { PendingRemoval } from './CompetencyAssociationsContext';
import { RemovalTargetKind } from './constants';
import { competencyQueryKeys, RuleBoxDeleteError } from './data/apiHooks';
import type { CompetencyCriteriaGroupsResponse, CompetencyRuleProfile } from './data/types';
import messages from './messages';
import type { CompetencyCriteriaGroupsIndex, RemovalTarget } from './utils';
import {
  buildCompetencyCriteriaGroupsIndex,
  subsectionNamesFromOutline,
  summarizeRemoval,
} from './utils';

interface UseRemovalConfirmationArgs {
  tagId: number;
  /** The listed course keys the groups query is scoped to, which are part of its cache key. */
  listedCourseKeys: string[] | undefined;
  index: CompetencyCriteriaGroupsIndex | undefined;
  systemDefaultProfile: CompetencyRuleProfile | undefined;
  /** The courses whose cached outlines name the dialog's courses and subsections. */
  courseIdsWithGroups: string[];
  /** Kept in the provider, whose `tagId` reset clears it during render, before the delete callbacks below exist. */
  pendingRemoval: PendingRemoval | null;
  setPendingRemoval: Dispatch<SetStateAction<PendingRemoval | null>>;
  isDeletingGroupOrRuleBoxOrCriterion: boolean;
  /** True while an association is being created, when deletes are dropped. */
  isAssociating: boolean;
  /** The provider's latest generation, read to tell a failure that lands after a competency switch. */
  generationRef: { readonly current: number; };
  /** The delete functions throw when the request fails, which `confirmRemoval` reports in the dialog. */
  removeCriterion: (criterionId: number, returnFocusTo: 'group' | 'subsection') => Promise<void>;
  deleteRuleBox: (groupId: number, criterionIds: number[]) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;
}

/** Owns the removal confirmation flow (`#786`): opening it, running the delete it names, and reporting a failure. */
export function useRemovalConfirmation({
  tagId,
  listedCourseKeys,
  index,
  systemDefaultProfile,
  courseIdsWithGroups,
  pendingRemoval,
  setPendingRemoval,
  isDeletingGroupOrRuleBoxOrCriterion,
  isAssociating,
  generationRef,
  removeCriterion,
  deleteRuleBox,
  deleteGroup,
}: UseRemovalConfirmationArgs) {
  const intl = useIntl();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  // Read once the delete settles, to see a cancel made while it ran.
  const pendingRemovalRef = useRef(pendingRemoval);
  pendingRemovalRef.current = pendingRemoval;
  // Closes the gap between a confirm click and the render that disables the dialog's button, so a second call in the
  // same tick cannot run another delete or close the dialog as if its own delete had succeeded. It holds the
  // generation that started the confirm, so a confirm still pending for the previous competency does not block this
  // one.
  const confirmingGenerationRef = useRef<number | null>(null);

  // Reuses the outline fetches that decide which courses are accessible.
  const outlineNames = useCallback(() => {
    const courseNamesByKey = new Map<string, string>();
    let subsectionNamesByUsageKey: Record<string, string> = {};
    courseIdsWithGroups.forEach((courseId) => {
      const outline = queryClient.getQueryData<CourseOutline>(courseOutlineQueryKeys.index(courseId));
      if (outline) {
        courseNamesByKey.set(courseId, outline.courseStructure.displayName);
        subsectionNamesByUsageKey = {
          ...subsectionNamesByUsageKey,
          ...subsectionNamesFromOutline(outline.courseStructure),
        };
      }
    });
    return { courseNamesByKey, subsectionNamesByUsageKey };
  }, [courseIdsWithGroups, queryClient]);

  const requestRemoval = useCallback((target: RemovalTarget) => {
    if (isDeletingGroupOrRuleBoxOrCriterion || isAssociating || !index || !systemDefaultProfile) {
      return;
    }
    const { courseNamesByKey, subsectionNamesByUsageKey } = outlineNames();
    const summary = summarizeRemoval(target, index, systemDefaultProfile, courseNamesByKey, subsectionNamesByUsageKey);
    if (summary) {
      setPendingRemoval({ target, summary, failure: null });
    }
  }, [
    isDeletingGroupOrRuleBoxOrCriterion,
    isAssociating,
    index,
    systemDefaultProfile,
    outlineNames,
    setPendingRemoval,
  ]);

  const cancelRemoval = useCallback(() => setPendingRemoval(null), [setPendingRemoval]);

  const confirmRemoval = useCallback(async () => {
    const pending = pendingRemovalRef.current;
    const startGeneration = generationRef.current;
    if (
      !pending
      || confirmingGenerationRef.current === startGeneration
      || isDeletingGroupOrRuleBoxOrCriterion
      || isAssociating
    ) {
      return;
    }
    confirmingGenerationRef.current = startGeneration;
    const { target } = pending;
    setPendingRemoval({ ...pending, failure: null });
    try {
      switch (target.kind) {
        case RemovalTargetKind.Association:
          await removeCriterion(target.criterionId, target.returnFocusTo);
          break;
        case RemovalTargetKind.RuleBox:
          await deleteRuleBox(target.groupId, target.criterionIds);
          break;
        case RemovalTargetKind.RuleGroup:
        case RemovalTargetKind.CourseGroup:
          await deleteGroup(target.groupId);
          break;
      }
      setPendingRemoval(null);
    } catch (error) {
      if (generationRef.current !== startGeneration) {
        // A competency switch cleared the dialog, and the failure belongs to the competency the author left.
        return;
      }
      if (pendingRemovalRef.current === null) {
        // Cancelled while the request ran, so there is no dialog left to report the failure in.
        showToast(intl.formatMessage(messages.removalFailedAfterCancelToastMessage));
        return;
      }
      // The error's count says how far a rule box delete got. The refetch cannot: when it fails too, React Query keeps
      // the pre-delete data, which would report a partial failure as nothing removed.
      const removedCount = target.kind === RemovalTargetKind.RuleBox && error instanceof RuleBoxDeleteError
        ? error.removedCount
        : 0;
      // The refetch has landed, so the summary is rebuilt from it: a retry then describes what is left.
      const freshData = queryClient.getQueryData<CompetencyCriteriaGroupsResponse>(
        competencyQueryKeys.competencyCriteriaGroups(tagId, listedCourseKeys),
      );
      // A retry sends only what is left of a rule box.
      let retryTarget: RemovalTarget = target;
      if (target.kind === RemovalTargetKind.RuleBox) {
        const unsentIds = target.criterionIds.slice(removedCount);
        retryTarget = {
          ...target,
          criterionIds: freshData
            ? unsentIds.filter((id) => freshData.criteria.some((criterion) => criterion.id === id))
            : unsentIds,
        };
      }
      const { courseNamesByKey, subsectionNamesByUsageKey } = outlineNames();
      const freshSummary = freshData && systemDefaultProfile
        ? summarizeRemoval(
          retryTarget,
          buildCompetencyCriteriaGroupsIndex(freshData),
          systemDefaultProfile,
          courseNamesByKey,
          subsectionNamesByUsageKey,
        )
        : null;
      if (freshData && systemDefaultProfile && freshSummary === null) {
        // The target is gone from the refetched data, which is the outcome the author asked for.
        setPendingRemoval(null);
        return;
      }
      setPendingRemoval((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          target: retryTarget,
          summary: freshSummary ?? prev.summary,
          failure: removedCount > 0 ? 'partly-removed' : 'nothing-removed',
        };
      });
    } finally {
      if (confirmingGenerationRef.current === startGeneration) {
        confirmingGenerationRef.current = null;
      }
    }
  }, [
    isDeletingGroupOrRuleBoxOrCriterion,
    isAssociating,
    generationRef,
    setPendingRemoval,
    removeCriterion,
    deleteRuleBox,
    deleteGroup,
    queryClient,
    tagId,
    listedCourseKeys,
    systemDefaultProfile,
    outlineNames,
    showToast,
    intl,
  ]);

  return { requestRemoval, confirmRemoval, cancelRemoval };
}
