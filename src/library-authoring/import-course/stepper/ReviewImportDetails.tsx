import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Stack } from '@openedx/paragon';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';

import { useEffect, useMemo } from 'react';
import { CheckCircle, Warning } from '@openedx/paragon/icons';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { useMigrationInfo } from '@src/library-authoring/data/apiHooks';
import { useGetBlockTypes, useGetContentHits } from '@src/search-manager';
import { SummaryCard } from './SummaryCard';
import messages from '../messages';

interface Props {
  courseId?: string;
  markAnalysisComplete: (analysisCompleted: boolean) => void;
}

interface BannerProps {
  courseId?: string;
  isBlockDataPending?: boolean;
  unsupportedBlockPercentage: number;
}

const Banner = ({ courseId, isBlockDataPending, unsupportedBlockPercentage }: BannerProps) => {
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

export const ReviewImportDetails = ({ courseId, markAnalysisComplete }: Props) => {
  const { data: blockTypes, isPending: isBlockDataPending } = useGetBlockTypes([
    `context_key = "${courseId}"`,
  ]);

  useEffect(() => {
    markAnalysisComplete(!isBlockDataPending);
  }, [isBlockDataPending]);

  const unsupportedBlockTypes = useMemo(() => {
    if (!blockTypes) {
      return undefined;
    }
    return Object.entries(blockTypes).filter(([blockType]) => (
      getConfig().LIBRARY_UNSUPPORTED_BLOCKS.includes(blockType)
    ));
  }, [blockTypes]);

  const totalUnsupportedBlocks = useMemo(() => {
    if (!unsupportedBlockTypes) {
      return 0;
    }
    const unsupportedBlocks = unsupportedBlockTypes.reduce((total, [, count]) => total + count, 0);
    return unsupportedBlocks;
  }, [unsupportedBlockTypes]);

  const { data: unsupportedBlocksData } = useGetContentHits(
    [
      `context_key = "${courseId}"`,
      `block_type IN [${unsupportedBlockTypes?.flatMap(([value]) => `"${value}"`).join(',')}]`,
    ],
    totalUnsupportedBlocks > 0,
    ['usage_key'],
    totalUnsupportedBlocks,
    'always',
  );

  const { data: unsupportedBlocksChildren } = useGetBlockTypes([
    `context_key = "${courseId}"`,
    `breadcrumbs.usage_key IN [${unsupportedBlocksData?.hits.map((value) => `"${value.usage_key}"`).join(',')}]`,
  ], (unsupportedBlocksData?.estimatedTotalHits || 0) > 0);

  const totalUnsupportedBlockChildren = useMemo(() => {
    if (!unsupportedBlocksChildren) {
      return 0;
    }
    const unsupportedBlocks = Object.values(unsupportedBlocksChildren).reduce((total, count) => total + count, 0);
    return unsupportedBlocks;
  }, [unsupportedBlocksChildren]);

  const finalUnssupportedBlocks = useMemo(
    () => totalUnsupportedBlocks + totalUnsupportedBlockChildren,
    [totalUnsupportedBlocks, totalUnsupportedBlockChildren],
  );

  const totalBlocks = useMemo(() => {
    if (!blockTypes) {
      return undefined;
    }
    return Object.values(blockTypes).reduce((total, block) => total + block, 0) - finalUnssupportedBlocks;
  }, [blockTypes, finalUnssupportedBlocks]);

  const totalComponents = useMemo(() => {
    if (!blockTypes) {
      return undefined;
    }
    return Object.entries(blockTypes).reduce(
      (total, [blockType, count]) => {
        const isComponent = !['chapter', 'sequential', 'vertical'].includes(blockType);
        if (isComponent) {
          return total + count;
        }
        return total;
      },
      0,
    ) - finalUnssupportedBlocks;
  }, [blockTypes, finalUnssupportedBlocks]);

  const unsupportedBlockPercentage = useMemo(() => {
    if (!blockTypes || !totalBlocks) {
      return 0;
    }
    return (finalUnssupportedBlocks / (totalBlocks + finalUnssupportedBlocks)) * 100;
  }, [blockTypes, finalUnssupportedBlocks]);

  return (
    <Stack gap={4}>
      <Banner
        courseId={courseId}
        isBlockDataPending={isBlockDataPending}
        unsupportedBlockPercentage={unsupportedBlockPercentage}
      />
      <h4><FormattedMessage {...messages.importCourseAnalysisSummary} /></h4>
      <SummaryCard
        totalBlocks={totalBlocks}
        totalComponents={totalComponents}
        sections={blockTypes?.chapter}
        subsections={blockTypes?.sequential}
        units={blockTypes?.vertical}
        unsupportedBlocks={finalUnssupportedBlocks}
        isPending={isBlockDataPending}
      />
      {!isBlockDataPending && finalUnssupportedBlocks > 0
        && (
        <>
          <h4><FormattedMessage {...messages.importCourseAnalysisDetails} /></h4>
          <Stack className="align-items-center" gap={3}>
            <FormattedMessage {...messages.importCourseAnalysisDetailsUnsupportedBlocksBody} />
          </Stack>
        </>
        )}
    </Stack>
  );
};
