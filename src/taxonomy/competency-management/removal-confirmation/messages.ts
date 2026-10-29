import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  removeDialogButton: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-dialog-button',
    defaultMessage: 'Remove',
    description: 'Label of the confirm button in the dialog that asks the author to confirm a removal on the Competency Management page.',
  },
  removalCannotBeUndoneMessage: {
    id: 'course-authoring.competency-management.removal-confirmation.removal-cannot-be-undone-message',
    defaultMessage: 'This can\'t be undone from this screen. Learners keep any mastery status they already have.',
    description: 'Closing sentence of every removal confirmation dialog, which warns that the removal cannot be reversed from this screen and reassures that learners keep any mastery they have already earned.',
  },
  removeAssociationDialogTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-association-dialog-title',
    defaultMessage: 'Remove {contentName} from {competencyName}?',
    description: 'Title of the confirmation dialog for removing one content association. {contentName} is the name of the course content, and {competencyName} is the name of the active competency.',
  },
  removeRuleGroupDialogTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-rule-group-dialog-title',
    defaultMessage: 'Remove this group?',
    description: 'Title of the confirmation dialog for removing a rule group.',
  },
  removeCourseGroupDialogTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-course-group-dialog-title',
    defaultMessage: 'Remove {courseName} from {competencyName}?',
    description: 'Title of the confirmation dialog for removing a whole course from a competency. {courseName} is the name of the course, and {competencyName} is the name of the active competency.',
  },
  removeRuleBoxDialogTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-rule-box-dialog-title',
    defaultMessage: 'Remove this rule from {competencyName}?',
    description: 'Title of the confirmation dialog for removing a rule box. {competencyName} is the name of the active competency.',
  },
  removeRuleGroupDialogBody: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-rule-group-dialog-body',
    defaultMessage: 'This also removes its <b>{count, plural, one {# content association} other {# content associations}}</b>.',
    description: 'Body of the dialog for removing a rule group. {count} is how many content associations the group holds. <b> marks the part shown in bold.',
  },
  removeOnlyRuleGroupDialogBody: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-only-rule-group-dialog-body',
    defaultMessage: 'This also removes its <b>{count, plural, one {# content association} other {# content associations}}</b>. It\'s the only group for {courseName}, so that course will no longer count toward <b>{competencyName}</b>.',
    description: 'Body of the dialog for removing a rule group that is the only one for its course. {count} is how many content associations the group holds, {courseName} is the course\'s name, and {competencyName} is the active competency\'s name. <b> marks the part shown in bold.',
  },
  removeCourseGroupDialogBody: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-course-group-dialog-body',
    defaultMessage: 'This also removes its <b>{count, plural, one {# content association} other {# content associations}}</b>, so {courseName} will no longer count toward <b>{competencyName}</b>.',
    description: 'Body of the dialog for removing a whole course from a competency. {count} is how many content associations the course holds, {courseName} is the course\'s name, and {competencyName} is the active competency\'s name. <b> marks the part shown in bold.',
  },
  removeRuleBoxDialogBody: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-rule-box-dialog-body',
    defaultMessage: 'This removes its <b>{count, plural, one {# content association} other {# content associations}}</b>, {contentNames}. The group\'s {otherRuleCount, plural, one {other rule stays} other {other rules stay}}.',
    description: 'Body of the dialog for removing a rule box when the group has other rules. {count} is how many content associations the rule holds, {contentNames} is a list of their names such as "Quiz 1 and Quiz 2", and {otherRuleCount} is how many other rules the group has. <b> marks the part shown in bold.',
  },
  removeOnlyRuleInGroupDialogBody: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-only-rule-in-group-dialog-body',
    defaultMessage: 'This removes its <b>{count, plural, one {# content association} other {# content associations}}</b>, {contentNames}. It\'s the group\'s only rule, so the group is removed too.',
    description: 'Body of the dialog for removing a rule box that is the only rule in its group. {count} is how many content associations the rule holds, and {contentNames} is a list of their names such as "Quiz 1 and Quiz 2". <b> marks the part shown in bold.',
  },
  removeOnlyRuleInCourseDialogBody: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-only-rule-in-course-dialog-body',
    defaultMessage: 'This removes its <b>{count, plural, one {# content association} other {# content associations}}</b>, {contentNames}. It\'s the only rule for {courseName}, so that course will no longer count toward <b>{competencyName}</b>.',
    description: 'Body of the dialog for removing a rule box that is the only rule for its course. {count} is how many content associations the rule holds, {contentNames} is a list of their names such as "Quiz 1 and Quiz 2", {courseName} is the course\'s name, and {competencyName} is the active competency\'s name. <b> marks the part shown in bold.',
  },
  removeAssociationFailedTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-association-failed-title',
    defaultMessage: 'Couldn\'t remove this association',
    description: 'Heading of the error alert in the dialog for removing one content association, shown when the request fails.',
  },
  removeRuleGroupFailedTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-rule-group-failed-title',
    defaultMessage: 'Couldn\'t remove this group',
    description: 'Heading of the error alert in the dialog for removing a rule group, shown when the request fails.',
  },
  removeCourseGroupFailedTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-course-group-failed-title',
    defaultMessage: 'Couldn\'t remove this course',
    description: 'Heading of the error alert in the dialog for removing a whole course from a competency, shown when the request fails.',
  },
  removeRuleBoxFailedTitle: {
    id: 'course-authoring.competency-management.removal-confirmation.remove-rule-box-failed-title',
    defaultMessage: 'Couldn\'t remove this rule',
    description: 'Heading of the error alert in the dialog for removing a rule box, shown when the request fails.',
  },
  nothingRemovedMessage: {
    id: 'course-authoring.competency-management.removal-confirmation.nothing-removed-message',
    defaultMessage: 'Nothing was removed. Try again, or refresh the page if this keeps happening.',
    description: 'Text of the error alert in a removal dialog when the request failed before anything was removed.',
  },
  partlyRemovedMessage: {
    id: 'course-authoring.competency-management.removal-confirmation.partly-removed-message',
    defaultMessage: 'Some of its content was removed. Try again to remove the rest, or refresh the page if this keeps happening.',
    description: 'Text of the error alert in the rule removal dialog when the request failed after some of the rule\'s content was already removed.',
  },
});

export default messages;
