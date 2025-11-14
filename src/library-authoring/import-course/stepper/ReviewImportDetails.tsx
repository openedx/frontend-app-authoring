import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Stack } from '@openedx/paragon';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';

import messages from '../messages';
import { SummaryCard } from './SummaryCard';

export const ReviewImportDetails = ({ courseId }: { courseId?: string }) => {
  const { data, isPending } = useCourseDetails(courseId);

  return (
    <Stack gap={4}>
      <Card>
        {data && !isPending ? (
          <Card.Section>
            <h4><FormattedMessage {...messages.importCourseInProgressStatusTitle} /></h4>
            <p>
              <FormattedMessage
                {...messages.importCourseInProgressStatusBody}
                values={{
                  courseName: data?.title || '',
                }}
              />
            </p>
          </Card.Section>
        ) : (
          <div className="text-center p-3">
            <LoadingSpinner />
          </div>
        )}
      </Card>
      <h4><FormattedMessage {...messages.importCourseAnalysisSummary} /></h4>
      <SummaryCard />
      <h4><FormattedMessage {...messages.importCourseDetailsTitle} /></h4>
      <Card className="p-6">
        <Stack className="align-items-center" gap={3}>
          <LoadingSpinner />
          <FormattedMessage {...messages.importCourseDetailsLoadingBody} />
        </Stack>
      </Card>
    </Stack>
  );
};
