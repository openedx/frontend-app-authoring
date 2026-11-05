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
  scoreThresholdLabel: {
    id: 'course-authoring.competency-management.criteria-groups.score-threshold-label',
    defaultMessage: 'With a score of <threshold>{op, select, gte {{value} or higher} lte {{value} or lower} other {{value}}}</threshold>',
    description: 'Label stating a rule box\'s score threshold, for example "With a score of 75% or higher". '
      + '"{op}" is the comparison: gte (at least), lte (at most) or any other value for an exact match. '
      + '"{value}" is the already formatted percentage. "<threshold>" wraps the part shown in the highlighted box.',
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
});

export default messages;
