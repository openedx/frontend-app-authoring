import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  logicOperatorAnyLabel: {
    id: 'course-authoring.competency-management.criteria-groups.logic-operator-any-label',
    defaultMessage: 'any',
    description: 'Label for a bottom-tier group\'s "or" logic operator, shown inline in '
      + '"By completing any of the following".',
  },
  logicOperatorAllLabel: {
    id: 'course-authoring.competency-management.criteria-groups.logic-operator-all-label',
    defaultMessage: 'all',
    description: 'Label for a bottom-tier group\'s "and" logic operator, shown inline in '
      + '"By completing all of the following".',
  },
  logicOperatorOrLabel: {
    id: 'course-authoring.competency-management.criteria-groups.logic-operator-or-label',
    defaultMessage: 'Or',
    description: 'Label for a course-level group\'s "or" logic operator, shown on the connector between '
      + 'two adjacent sibling bottom-tier groups.',
  },
  logicOperatorAndLabel: {
    id: 'course-authoring.competency-management.criteria-groups.logic-operator-and-label',
    defaultMessage: 'And',
    description: 'Label for a course-level group\'s "and" logic operator, shown on the connector between '
      + 'two adjacent sibling bottom-tier groups.',
  },
  criteriaGroupBoxLabel: {
    id: 'course-authoring.competency-management.criteria-groups.criteria-group-box-label',
    defaultMessage: 'By completing {operator} of the following',
    description: 'Header sentence on a bottom-tier group\'s bracket, naming how its rule boxes combine. '
      + '"{operator}" is replaced by the word "any" or "all".',
  },
  scoreThresholdPhrase: {
    id: 'course-authoring.competency-management.criteria-groups.score-threshold-phrase',
    defaultMessage: '{op, select, gte {{value} or higher} lte {{value} or lower} other {{value}}}',
    description: 'A rule\'s score threshold, for example "75% or higher". '
      + '"{op}" is the comparison: gte (at least), lte (at most) or any other value for an exact match. '
      + '"{value}" is the already formatted percentage.',
  },
  scoreThresholdLabel: {
    id: 'course-authoring.competency-management.criteria-groups.score-threshold-label',
    defaultMessage: 'With a score of <threshold>{score}</threshold>',
    description: 'Label stating a rule box\'s score threshold, for example "With a score of 75% or higher". '
      + '"{score}" is the threshold phrase, such as "75% or higher". '
      + '"<threshold>" wraps the part shown in the highlighted box.',
  },
  unknownSubsectionLabel: {
    id: 'course-authoring.competency-management.criteria-groups.unknown-subsection-label',
    defaultMessage: 'Content unavailable',
    description: 'Fallback chip text for a criterion whose associated subsection isn\'t found in its '
      + 'course\'s outline (deleted content or search-index lag, not a permission boundary).',
  },
  fromWithinCourseLabel: {
    id: 'course-authoring.competency-management.criteria-groups.from-within-course-label',
    defaultMessage: 'From within {courseName} ...',
    description: 'Header sentence on a course-level group\'s card, naming the course its bottom-tier groups '
      + 'belong to. "{courseName}" is the course\'s name.',
  },
  expandCourseGroupButtonLabel: {
    id: 'course-authoring.competency-management.criteria-groups.expand-course-group.button-label',
    defaultMessage: 'Expand {courseName}',
    description: 'Accessible label for the disclosure control that expands a collapsed course-level '
      + 'associations group. "{courseName}" is the course\'s name.',
  },
  collapseCourseGroupButtonLabel: {
    id: 'course-authoring.competency-management.criteria-groups.collapse-course-group.button-label',
    defaultMessage: 'Collapse {courseName}',
    description: 'Accessible label for the disclosure control that collapses an expanded course-level '
      + 'associations group. "{courseName}" is the course\'s name.',
  },
  courseGroupListErrorMessage: {
    id: 'course-authoring.competency-management.criteria-groups.course-group-list-error-message',
    defaultMessage: 'There was a problem loading this competency\'s associations. Please try again.',
    description: 'Inline error message shown when loading a competency\'s existing criteria groups, or the '
      + 'system default rule profile, fails.',
  },
  noAssociationsMessage: {
    id: 'course-authoring.competency-management.criteria-groups.no-associations-message',
    defaultMessage: 'No content associated.',
    description: 'First line of the empty state shown in the associations block when the selected competency '
      + 'has no course content associated with it yet.',
  },
  noAssociationsPromptMessage: {
    id: 'course-authoring.competency-management.criteria-groups.no-associations-prompt-message',
    defaultMessage: 'Make content selections to associate this competency with course content.',
    description: 'Second line of the empty state shown in the associations block, prompting the user '
      + 'to make content selections below.',
  },
  scoreThresholdInputAccessibleLabel: {
    id: 'course-authoring.competency-management.criteria-groups.score-threshold-input-accessible-label',
    defaultMessage: 'Score threshold percentage',
    description: 'Accessible name for the editable score-threshold input, which otherwise relies on the '
      + 'surrounding sentence ("With a score of ___% or higher") for sighted users only.',
  },
  duplicateScoreValidationMessage: {
    id: 'course-authoring.competency-management.criteria-groups.duplicate-score-validation-message',
    defaultMessage: 'Another rule box in this group already uses this score.',
    description: 'Inline validation message shown while editing a rule box\'s score threshold, when the typed '
      + 'value would exactly duplicate another rule box\'s own score, rule type, and comparison in the same '
      + 'group.',
  },
  scoreThresholdRangeValidationMessage: {
    id: 'course-authoring.competency-management.criteria-groups.score-threshold-range-validation-message',
    defaultMessage: 'Enter a whole number from 0 to 100.',
    description: 'Inline validation message shown while editing a rule box\'s score threshold, when the typed '
      + 'value is not a whole number from 0 to 100.',
  },
  selectRuleBoxButtonLabel: {
    id: 'course-authoring.competency-management.criteria-groups.select-rule-box-button-label',
    defaultMessage: 'Select this rule',
    description: 'Visually hidden accessible label for the button that selects a rule box, stretched to cover '
      + 'the whole box - the box has no single short visible phrase of its own to reuse as this label.',
  },
  defaultScoreTakenHint: {
    id: 'course-authoring.competency-management.criteria-groups.default-score-taken-hint',
    defaultMessage: 'Another rule in this group already uses {score}. Choose a different score.',
    description: 'Guidance under a new, empty rule box whose score is already used by another rule in the same '
      + 'group. "{score}" is the score as shown in the field, such as "75% or higher".',
  },
  useSuggestedScoreLink: {
    id: 'course-authoring.competency-management.criteria-groups.use-suggested-score-link',
    defaultMessage: 'Use {score}',
    description: 'Link under the "score already used" guidance that applies the nearest unused score. '
      + '"{score}" is that score as shown in the field, such as "80% or higher".',
  },
  addRuleButtonLabel: {
    id: 'course-authoring.competency-management.criteria-groups.add-rule-button-label',
    defaultMessage: 'Rule',
    description: 'Label for the button that adds a new, not-yet-saved rule box to a bottom-tier group.',
  },
  addRuleGroupButtonLabel: {
    id: 'course-authoring.competency-management.criteria-groups.add-rule-group-button-label',
    defaultMessage: 'Rule Group',
    description: 'Label for the button that adds a new, not-yet-saved bottom-tier group to a course-level group.',
  },
  addRuleAccessibleLabel: {
    id: 'course-authoring.competency-management.criteria-groups.add-rule-accessible-label',
    defaultMessage: 'Add Rule',
    description: 'Accessible name of the button that adds a new rule box, whose visible label is just "Rule".',
  },
  addRuleGroupAccessibleLabel: {
    id: 'course-authoring.competency-management.criteria-groups.add-rule-group-accessible-label',
    defaultMessage: 'Add Rule Group',
    description: 'Accessible name of the button that adds a new rule group, whose visible label is just "Rule Group".',
  },
  addControlDisabledTooltip: {
    id: 'course-authoring.competency-management.criteria-groups.add-control-disabled-tooltip',
    defaultMessage: 'Fill in the empty box before adding another.',
    description: 'Tooltip on a disabled "+ Rule"/"+ Rule Group" button, shown while a not-yet-saved placeholder '
      + 'already exists elsewhere in the tree.',
  },
  addControlSavingTooltip: {
    id: 'course-authoring.competency-management.criteria-groups.add-control-saving-tooltip',
    defaultMessage: 'Wait for the save to finish before adding another.',
    description: 'Tooltip on a disabled "+ Rule"/"+ Rule Group" button, shown while a create request is '
      + 'still in flight.',
  },
  placeholderRuleBoxHint: {
    id: 'course-authoring.competency-management.criteria-groups.placeholder-rule-box-hint',
    defaultMessage: 'Select content below to add it here.',
    description: 'Hint text shown in place of chips on a not-yet-saved placeholder rule box, which has no '
      + 'content associated with it yet.',
  },
  scoreSettingsHeading: {
    id: 'course-authoring.competency-management.criteria-groups.score-settings-heading',
    defaultMessage: 'Competency Completion Rule',
    description: 'Heading of the popover where a rule box\'s comparison and score are edited.',
  },
  comparisonOperatorAccessibleLabel: {
    id: 'course-authoring.competency-management.criteria-groups.comparison-operator-accessible-label',
    defaultMessage: 'Comparison, {operator}',
    description: 'Accessible name of the menu button that picks how a score is compared. "{operator}" is the '
      + 'current comparison in words, such as "or higher".',
  },
  comparisonEqLabel: {
    id: 'course-authoring.competency-management.criteria-groups.comparison-eq-label',
    defaultMessage: 'equal to',
    description: 'The comparison in words for a rule that matches an exact score, used in the accessible name '
      + 'of the comparison menu button.',
  },
  comparisonGteLabel: {
    id: 'course-authoring.competency-management.criteria-groups.comparison-gte-label',
    defaultMessage: 'or higher',
    description: 'Accessible name of the ">=" menu item, which sets the rule to match a score or higher.',
  },
  comparisonLteLabel: {
    id: 'course-authoring.competency-management.criteria-groups.comparison-lte-label',
    defaultMessage: 'or lower',
    description: 'Accessible name of the "<=" menu item, which sets the rule to match a score or lower.',
  },
});

export default messages;
