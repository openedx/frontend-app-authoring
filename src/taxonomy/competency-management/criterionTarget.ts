import type { CriteriaFocus, CriteriaPlaceholder } from './CompetencyAssociationsContext';
import type {
  CompetencyRuleProfile,
  CreateCompetencyCriterionPayload,
  GradeRulePayload,
} from './data/types';
import { isRuleTakenInGroup, isSameRulePayload, ruleBoxesForGroup } from './utils';
import type { CompetencyCriteriaGroupsIndex } from './utils';

export type CreateCriterionFields = Omit<CreateCompetencyCriterionPayload, 'object_id'>;
export type CreateTarget = { kind: 'create'; fields: CreateCriterionFields; } | { kind: 'duplicate'; };

/** The course key of the focused group, or `undefined` when there is no focus or the group is unknown. */
export function courseKeyOfFocus(
  focus: CriteriaFocus | null,
  placeholder: CriteriaPlaceholder,
  index: CompetencyCriteriaGroupsIndex,
): string | undefined {
  if (!focus) {
    return undefined;
  }
  // A placeholder group has no real id, so its course comes from its parent group.
  const courseGroupId = focus.groupId === null
    ? placeholder.parentRuleGroupId
    : index.groupsById.get(focus.groupId)?.parentId;
  if (courseGroupId == null) {
    return undefined;
  }
  return index.groupsById.get(courseGroupId)?.courseKey ?? undefined;
}

// openedx-core ADR 0002: the override pair is sent complete or not at all.
// A score equal to the default sends no pair, so the criterion follows the default profile.
function overrideFields(profile: CompetencyRuleProfile, rulePayload: GradeRulePayload | null): CreateCriterionFields {
  if (rulePayload === null || isSameRulePayload(rulePayload, profile.rulePayload)) {
    return {};
  }
  return { rule_type_override: profile.ruleType, rule_payload_override: rulePayload };
}

function fieldsForRealRuleBox(
  groupId: number,
  ruleKey: string,
  index: CompetencyCriteriaGroupsIndex,
  profile: CompetencyRuleProfile,
): CreateCriterionFields {
  const box = ruleBoxesForGroup(groupId, index, profile).find((candidate) => candidate.key === ruleKey);
  // A stale key still targets the group, so the criterion lands there with no override and follows the default profile.
  if (!box) {
    return { group_id: groupId };
  }
  return { group_id: groupId, rule_type_override: box.rule.ruleType, rule_payload_override: box.rule.rulePayload };
}

function targetForPlaceholderRuleBox(
  groupId: number,
  placeholder: CriteriaPlaceholder,
  index: CompetencyCriteriaGroupsIndex,
  profile: CompetencyRuleProfile,
): CreateTarget {
  const placeholderRule = {
    ruleType: profile.ruleType,
    rulePayload: placeholder.rulePayload ?? profile.rulePayload,
  };
  // Sending an untouched duplicate would silently merge into the existing box.
  if (isRuleTakenInGroup(placeholderRule, ruleBoxesForGroup(groupId, index, profile))) {
    return { kind: 'duplicate' };
  }
  return { kind: 'create', fields: { group_id: groupId, ...overrideFields(profile, placeholder.rulePayload) } };
}

function fieldsForPlaceholderGroup(
  placeholder: CriteriaPlaceholder,
  profile: CompetencyRuleProfile,
): CreateCriterionFields {
  return { logic_operator: placeholder.logicOperator, ...overrideFields(profile, placeholder.rulePayload) };
}

/**
 * Decides how a new criterion is placed given the focus: the fields to send
 * with the create request, or `duplicate` when the placeholder rule box would
 * repeat an existing rule. Focus in another course than `courseId` is ignored.
 */
export function resolveCreateTarget(
  courseId: string,
  focus: CriteriaFocus | null,
  placeholder: CriteriaPlaceholder,
  index: CompetencyCriteriaGroupsIndex,
  profile: CompetencyRuleProfile,
): CreateTarget {
  if (!focus || courseKeyOfFocus(focus, placeholder, index) !== courseId) {
    return { kind: 'create', fields: {} };
  }
  if (focus.groupId === null) {
    return { kind: 'create', fields: fieldsForPlaceholderGroup(placeholder, profile) };
  }
  if (focus.ruleKey === null) {
    return targetForPlaceholderRuleBox(focus.groupId, placeholder, index, profile);
  }
  return { kind: 'create', fields: fieldsForRealRuleBox(focus.groupId, focus.ruleKey, index, profile) };
}
