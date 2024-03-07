import { useEffect, useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';
import getFilteredChecklist from './utils/getFilteredChecklist';
import getValidatedValue from './utils/getValidatedValue';

export const useChecklistState = ({ data, dataList }) => {
  const [checklistState, setChecklistState] = useState({
    checks: [],
    totalCompletedChecks: 0,
    values: {},
  });

  const updateChecklistState = () => {
    if (Object.keys(data).length > 0) {
      const { isSelfPaced } = data;
      const hasCertificatesEnabled = data.certificates && data.certificates.isEnabled;
      const hasHighlightsEnabled = data.sections && data.sections.highlightsEnabled;
      const needsProctoringEscalationEmail = (
        data.proctoring && data.proctoring.needsProctoringEscalationEmail
      );
      const checks = getFilteredChecklist(
        dataList,
        isSelfPaced,
        hasCertificatesEnabled,
        hasHighlightsEnabled,
        needsProctoringEscalationEmail,
      );

      const values = {};
      let totalCompletedChecks = 0;

      checks.forEach((check) => {
        const value = getValidatedValue(data, check.id);

        if (value) {
          totalCompletedChecks += 1;
        }

        values[check.id] = value;
      });

      setChecklistState({
        checks,
        totalCompletedChecks,
        values,
      });
    }
  };

  useEffect(() => {
    updateChecklistState();
  }, [data]);

  return {
    checklistState,
    setChecklistState,
  };
};

export const getCompletionCount = (checks, totalCompletedChecks) => {
  const totalChecks = Object.values(checks).length;

  return (
    <FormattedMessage
      {...messages.completionCountLabel}
      values={{ completed: totalCompletedChecks, total: totalChecks }}
    />
  );
};
