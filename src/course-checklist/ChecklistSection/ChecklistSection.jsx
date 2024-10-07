import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { Container, Stack } from '@openedx/paragon';

import { LoadingSpinner } from '../../generic/Loading';
import { getCompletionCount, useChecklistState } from './hooks';
import ChecklistItemBody from './ChecklistItemBody';
import ChecklistItemComment from './ChecklistItemComment';
import { checklistItems } from './utils/courseChecklistData';

const ChecklistSection = ({
  courseId,
  dataHeading,
  data,
  idPrefix,
  isLoading,
}) => {
  const dataList = checklistItems[idPrefix];
  const getCompletionCountID = () => (`${idPrefix}-completion-count`);
  const { checklistState } = useChecklistState({ data, dataList });
  const { checks, totalCompletedChecks, values } = checklistState;

  return (
    <Container>
      <h3 aria-describedby={getCompletionCountID()} className="lead">{dataHeading}</h3>
      {isLoading ? (
        <div className="row justify-content-center" data-testid="loading-spinner">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div data-testid="completion-subheader">
            {getCompletionCount(checks, totalCompletedChecks)}
          </div>
          <Stack gap={3} className="mt-3">
            {checks.map(check => {
              const checkId = check.id;
              const isCompleted = values[checkId];
              return (
                <div
                  className={`bg-white border py-3 px-4 ${isCompleted && 'checklist-item-complete'}`}
                  id={`checklist-item-${checkId}`}
                  data-testid={`checklist-item-${checkId}`}
                  key={checkId}
                >
                  <ChecklistItemBody courseId={courseId} {...{ checkId, isCompleted }} />
                  <div data-testid={`comment-section-${checkId}`}>
                    <ChecklistItemComment {...{ courseId, checkId, data }} />
                  </div>
                </div>
              );
            })}
          </Stack>
        </>
      )}
    </Container>
  );
};

ChecklistSection.defaultProps = {
  data: {},
};

ChecklistSection.propTypes = {
  courseId: PropTypes.string.isRequired,
  dataHeading: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.shape({
      assignments: PropTypes.shape({
        totalNumber: PropTypes.number,
        totalVisible: PropTypes.number,
        numWithDatesBeforeEnd: PropTypes.number,
        numWithDates: PropTypes.number,
        numWithDatesAfterStart: PropTypes.number,
      }),
      dates: PropTypes.shape({
        hasStartDate: PropTypes.bool,
        hasEndDate: PropTypes.bool,
      }),
      updates: PropTypes.shape({
        hasUpdate: PropTypes.bool,
      }),
      certificates: PropTypes.shape({
        isEnabled: PropTypes.bool,
        isActivated: PropTypes.bool,
        hasCertificate: PropTypes.bool,
      }),
      grades: PropTypes.shape({
        sumOfWeights: PropTypes.number,
      }),
      is_self_paced: PropTypes.bool,
    }).isRequired,
    PropTypes.shape({
      assignments: PropTypes.shape({
        totalNumber: PropTypes.number,
        totalVisible: PropTypes.number,
        /* eslint-disable react/forbid-prop-types */
        assignmentsWithDatesBeforeStart: PropTypes.array,
        assignmentsWithDatesAfterEnd: PropTypes.array,
        assignmentsWithOraDatesBeforeStart: PropTypes.array,
        assignmentsWithOraDatesAfterEnd: PropTypes.array,
        /* eslint-enable react/forbid-prop-types */
      }),
      dates: PropTypes.shape({
        hasStartDate: PropTypes.bool,
        hasEndDate: PropTypes.bool,
      }),
      updates: PropTypes.shape({
        hasUpdate: PropTypes.bool,
      }),
      certificates: PropTypes.shape({
        isEnabled: PropTypes.bool,
        isActivated: PropTypes.bool,
        hasCertificate: PropTypes.bool,
      }),
      grades: PropTypes.shape({
        hasGradingPolicy: PropTypes.bool,
        sumOfWeights: PropTypes.number,
      }),
      proctoring: PropTypes.shape({
        needsProctoringEscalationEmail: PropTypes.bool,
        hasProctoringEscalation_email: PropTypes.bool,
      }),
      isSelfPaced: PropTypes.bool,
    }).isRequired,
  ]),
  idPrefix: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default injectIntl(ChecklistSection);
