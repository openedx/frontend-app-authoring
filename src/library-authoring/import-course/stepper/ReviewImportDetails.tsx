import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Stack } from '@openedx/paragon';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';

import { useEffect, useMemo } from 'react';
import { CheckCircle, Info, Warning } from '@openedx/paragon/icons';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { useMigrationInfo } from '@src/library-authoring/data/apiHooks';
import { usePreviewMigration } from '@src/data/apiHooks';
import { SummaryCard } from './SummaryCard';
import messages from '../messages';

interface Props {
  courseId?: string;
  markAnalysisComplete: (analysisCompleted: boolean) => void;
  setImportIsBlocked: (importIsBlocked: boolean) => void;
}

interface BannerProps {
  courseId?: string;
  isBlockDataPending?: boolean;
  limitIsExceeded?: boolean;
  limitNumber?: number;
  unsupportedBlockPercentage: number;
}

const Banner = ({
  courseId,
  isBlockDataPending,
  limitIsExceeded,
  limitNumber,
  unsupportedBlockPercentage,
}: BannerProps) => {
  const { data, isPending } = useCourseDetails(courseId);
  const { libraryId } = useLibraryContext();
  const { data: migrationInfoData, isPending: migrationInfoIsPending } = useMigrationInfo(
    [courseId!],
    (courseId !== undefined && libraryId !== undefined),
  );

  const currentMigrationInfo = useMemo(() => {
    if (!migrationInfoData || !courseId) {
      return undefined;
    }
    return Object.values(migrationInfoData)[0]?.find(info => info.targetKey === libraryId);
  }, [migrationInfoData]);

  if (isPending) {
    return (
      <Alert>
        <div className="text-center p-3">
          <LoadingSpinner />
        </div>
      </Alert>
    );
  }

  if (isBlockDataPending || migrationInfoIsPending) {
    return (
      <Alert>
        <Alert.Heading><FormattedMessage {...messages.importCourseInProgressStatusTitle} /></Alert.Heading>
        <p>
          <FormattedMessage
            {...messages.importCourseInProgressStatusBody}
            values={{
              courseName: data?.title || '',
            }}
          />
        </p>
      </Alert>
    );
  }

  if (limitIsExceeded) {
    return (
      <>
        <Alert variant="danger" icon={Info}>
          <Alert.Heading>
            <FormattedMessage {...messages.importBlockedTitle} />
          </Alert.Heading>
        </Alert>
        <FormattedMessage
          {...messages.importBlockedBody}
          values={{ limitNumber }}
        />
      </>
    );
  }

  if (currentMigrationInfo) {
    return (
      <>
        <Alert variant="warning" icon={Warning}>
          <Alert.Heading><FormattedMessage {...messages.importCourseAnalysisCompleteReimportTitle} /></Alert.Heading>
        </Alert>
        <p>
          <FormattedMessage
            {...messages.importCourseAnalysisCompleteReimportBody}
            values={{
              courseName: data?.title || '',
              libraryName: currentMigrationInfo?.targetTitle || '',
            }}
          />
        </p>
      </>
    );
  }

  if (unsupportedBlockPercentage > 0) {
    return (
      <Alert variant="warning" icon={Warning}>
        <Alert.Heading><FormattedMessage {...messages.importCourseAnalysisCompleteSomeContentTitle} /></Alert.Heading>
        <p>
          <FormattedMessage
            {...messages.importCourseAnalysisCompleteSomeContentBody}
            values={{
              unsupportedBlockPercentage: unsupportedBlockPercentage.toFixed(2),
            }}
          />
        </p>
      </Alert>
    );
  }

  return (
    <Alert variant="success" icon={CheckCircle}>
      <Alert.Heading><FormattedMessage {...messages.importCourseAnalysisCompleteAllContentTitle} /></Alert.Heading>
      <p>
        <FormattedMessage
          {...messages.importCourseAnalysisCompleteAllContentBody}
          values={{
            courseName: data?.title || '',
          }}
        />
      </p>
    </Alert>
  );
};

export const ReviewImportDetails = ({
  courseId,
  markAnalysisComplete,
  setImportIsBlocked,
}: Props) => {
  const { libraryId } = useLibraryContext();

  const {
    data: previewMigrationData,
    isPending: isPreviewMigrationPending,
  } = usePreviewMigration(libraryId, courseId);

  const limitIsExceeded = previewMigrationData?.state === 'block_limit_reached';
  const unssuportedBlocks = previewMigrationData?.unsupportedBlocks || 0;
  const totalBlocks = (previewMigrationData?.totalBlocks || 0) - unssuportedBlocks;
  const totalComponents = (previewMigrationData?.totalComponents || 0) - unssuportedBlocks;

  useEffect(() => {
    // Mark complete to inform parent component of analysis completion.
    markAnalysisComplete(!isPreviewMigrationPending);
    setImportIsBlocked(limitIsExceeded);
  }, [isPreviewMigrationPending, limitIsExceeded]);

  return (
    <Stack gap={4}>
      <Banner
        courseId={courseId}
        isBlockDataPending={isPreviewMigrationPending}
        limitIsExceeded={limitIsExceeded}
        limitNumber={previewMigrationData?.blocksLimit}
        unsupportedBlockPercentage={previewMigrationData?.unsupportedPercentage || 0}
      />
      {!limitIsExceeded && (
        <>
          <h4><FormattedMessage {...messages.importCourseAnalysisSummary} /></h4>
          <SummaryCard
            totalBlocks={totalBlocks}
            totalComponents={totalComponents}
            sections={previewMigrationData?.sections}
            subsections={previewMigrationData?.subsections}
            units={previewMigrationData?.units}
            unsupportedBlocks={unssuportedBlocks}
            isPending={isPreviewMigrationPending}
          />
          {!isPreviewMigrationPending && unssuportedBlocks > 0
            && (
            <>
              <h4><FormattedMessage {...messages.importCourseAnalysisDetails} /></h4>
              <Stack className="align-items-center" gap={3}>
                <FormattedMessage {...messages.importCourseAnalysisDetailsUnsupportedBlocksBody} />
              </Stack>
            </>
            )}
        </>
      )}
    </Stack>
  );
};
