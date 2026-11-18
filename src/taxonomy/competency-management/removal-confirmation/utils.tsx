import type { ReactNode } from 'react';
import type { IntlShape } from 'react-intl';

import criteriaGroupsMessages from '@src/taxonomy/competency-management/criteria-groups/messages';
import { RemovalTargetKind } from '@src/taxonomy/competency-management/constants';
import type { RemovalSummary } from '@src/taxonomy/competency-management/utils';
import messages from './messages';

interface DescribeRemovalResult {
  title: string;
  failedTitle: string;
  details: ReactNode;
}

/** The dialog's wording for one removal: its title, the alert title when the request fails, and an optional body. */
export const describeRemoval = (
  intl: IntlShape,
  summary: RemovalSummary,
  competencyName: string,
): DescribeRemovalResult => {
  const bold = { b: (chunks: ReactNode) => <strong>{chunks}</strong> };
  const nameOf = (name: string | null) => name ?? intl.formatMessage(criteriaGroupsMessages.unknownSubsectionLabel);

  const warning = (leavesCourseWithoutAssociations: boolean) => (
    leavesCourseWithoutAssociations
      ? intl.formatMessage(messages.lastAssociationWarningMessage, { competencyName })
      : null
  );
  // The warning follows the body's other sentences.
  const withWarning = (body: ReactNode, leavesCourseWithoutAssociations: boolean): ReactNode => (
    leavesCourseWithoutAssociations ? <>{body} {warning(true)}</> : body
  );

  switch (summary.kind) {
    case RemovalTargetKind.Association:
      return {
        title: summary.contentName === null
          ? intl.formatMessage(messages.removeUnavailableAssociationDialogTitle, { competencyName })
          : intl.formatMessage(messages.removeAssociationDialogTitle, {
            contentName: summary.contentName,
            competencyName,
          }),
        failedTitle: intl.formatMessage(messages.removeAssociationFailedTitle),
        details: warning(summary.leavesCourseWithoutAssociations),
      };
    case RemovalTargetKind.RuleGroup:
      return {
        title: intl.formatMessage(messages.removeRuleGroupDialogTitle),
        failedTitle: intl.formatMessage(messages.removeRuleGroupFailedTitle),
        details: withWarning(
          intl.formatMessage(messages.removeRuleGroupDialogBody, { ...bold, count: summary.associationCount }),
          summary.leavesCourseWithoutAssociations,
        ),
      };
    case RemovalTargetKind.CourseGroup:
      return {
        title: intl.formatMessage(messages.removeCourseGroupDialogTitle, {
          courseName: summary.courseName,
          competencyName,
        }),
        failedTitle: intl.formatMessage(messages.removeCourseGroupFailedTitle),
        // Removing a course always leaves it without associations.
        details: withWarning(
          intl.formatMessage(messages.removeRuleGroupDialogBody, { ...bold, count: summary.associationCount }),
          true,
        ),
      };
    case RemovalTargetKind.RuleBox:
      return {
        title: intl.formatMessage(messages.removeRuleBoxDialogTitle, { competencyName }),
        failedTitle: intl.formatMessage(messages.removeRuleBoxFailedTitle),
        details: withWarning(
          intl.formatMessage(
            summary.otherRuleCount > 0 ? messages.removeRuleBoxDialogBody : messages.removeOnlyRuleInGroupDialogBody,
            {
              ...bold,
              count: summary.contentNames.length,
              contentNames: intl.formatList(summary.contentNames.map(nameOf), { type: 'conjunction' }),
              otherRuleCount: summary.otherRuleCount,
            },
          ),
          summary.leavesCourseWithoutAssociations,
        ),
      };
  }
};
