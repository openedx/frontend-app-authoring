import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Stack } from '@openedx/paragon';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';

import messages from '../messages';
import { SummaryCard } from './SummaryCard';
import { useGetBlockTypes } from '../../search-manager';
import { useMemo } from 'react';

export const ReviewImportDetails = ({ courseId }: { courseId?: string }) => {
  const { data, isPending } = useCourseDetails(courseId);
  const { data: blockTypes, isPending: isBlockDataPending } = useGetBlockTypes([
    `context_key = "${courseId}"`,
  ]);

  const totalUnsupportedBlocks = useMemo(() => {
    if (!blockTypes) {
      return 0;
    }
    const unsupportedBlocks = Object.entries(blockTypes).reduce((total, [blockType, count]) => {
      const isUnsupportedBlock = getConfig().LIBRARY_UNSUPPORTED_BLOCKS.includes(blockType);
      if (isUnsupportedBlock) {
        return total + count;
      }
      return total;
    }, 0);
    return unsupportedBlocks;
  }, [blockTypes])

  const totalBlocks = useMemo(() => {
    if (!blockTypes) {
      return undefined;
    }
    return Object.values(blockTypes).reduce((total, block) => total + block, 0) - totalUnsupportedBlocks;
  }, [blockTypes])

  const totalComponents = useMemo(() => {
    if (!blockTypes) {
      return undefined;
    }
    return Object.entries(blockTypes).reduce(
      (total, [blockType, count]) => {
        const isComponent = !["chapter", "sequential", "vertical"].includes(blockType);
        if (isComponent) {
          return total + count;
        }
        return total;
      },
      0
    ) - totalUnsupportedBlocks;
  }, [blockTypes])

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
      <SummaryCard
        totalBlocks={totalBlocks}
        totalComponents={totalComponents}
        sections={blockTypes?.chapter}
        subsections={blockTypes?.sequential}
        units={blockTypes?.vertical}
        unsupportedBlocks={totalUnsupportedBlocks}
        isPending={isBlockDataPending}
      />
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
