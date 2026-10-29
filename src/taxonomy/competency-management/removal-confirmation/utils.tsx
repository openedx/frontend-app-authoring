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

  switch (summary.kind) {
    case RemovalTargetKind.Association:
      return {
        title: intl.formatMessage(messages.removeAssociationDialogTitle, {
          contentName: nameOf(summary.contentName),
          competencyName,
        }),
        failedTitle: intl.formatMessage(messages.removeAssociationFailedTitle),
        details: null,
      };
    case RemovalTargetKind.RuleGroup:
      return {
        title: intl.formatMessage(messages.removeRuleGroupDialogTitle),
        failedTitle: intl.formatMessage(messages.removeRuleGroupFailedTitle),
        details: intl.formatMessage(
          summary.isOnlyGroupInCourse ? messages.removeOnlyRuleGroupDialogBody : messages.removeRuleGroupDialogBody,
          {
            ...bold,
            count: summary.associationCount,
            courseName: summary.courseName,
            competencyName,
          },
        ),
      };
    case RemovalTargetKind.CourseGroup:
      return {
        title: intl.formatMessage(messages.removeCourseGroupDialogTitle, {
          courseName: summary.courseName,
          competencyName,
        }),
        failedTitle: intl.formatMessage(messages.removeCourseGroupFailedTitle),
        details: intl.formatMessage(messages.removeCourseGroupDialogBody, {
          ...bold,
          count: summary.associationCount,
          courseName: summary.courseName,
          competencyName,
        }),
      };
    case RemovalTargetKind.RuleBox: {
      let body = messages.removeOnlyRuleInGroupDialogBody;
      if (summary.otherRuleCount > 0) {
        body = messages.removeRuleBoxDialogBody;
      } else if (summary.isOnlyGroupInCourse) {
        body = messages.removeOnlyRuleInCourseDialogBody;
      }
      return {
        title: intl.formatMessage(messages.removeRuleBoxDialogTitle, { competencyName }),
        failedTitle: intl.formatMessage(messages.removeRuleBoxFailedTitle),
        details: intl.formatMessage(body, {
          ...bold,
          count: summary.contentNames.length,
          contentNames: intl.formatList(summary.contentNames.map(nameOf), { type: 'conjunction' }),
          otherRuleCount: summary.otherRuleCount,
          courseName: summary.courseName,
          competencyName,
        }),
      };
    }
  }
};
