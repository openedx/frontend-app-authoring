import { useContext, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Stack, Container, Alert, Layout, Button,
  DataTable,
} from '@openedx/paragon';

import Header from '@src/header';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import SubHeader from '@src/generic/sub-header/SubHeader';
import {
  ArrowForward, CheckCircle, Info, WarningFilled,
} from '@openedx/paragon/icons';
import Loading from '@src/generic/Loading';
import { ToastContext } from '@src/generic/toast-context';
import { Paragraph } from '@src/utils';

import { useBulkModulestoreMigrate, useModulestoreMigrationStatus } from '@src/data/apiHooks';
import { useGetContentHits } from '@src/search-manager';
import messages from './messages';
import { SummaryCard } from './stepper/SummaryCard';
import { HelpSidebar } from './HelpSidebar';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useMigrationBlocksInfo } from '../data/apiHooks';

export const ImportDetailsPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { libraryId, libraryData, readOnly } = useLibraryContext();
  const [enableRefeshState, setEnableRefreshState] = useState(true);
  const { courseId, migrationTaskId } = useParams();
  const { showToast } = useContext(ToastContext);
  const [disableReimport, setDisableReimport] = useState(false);

  // Using bulk migrate as it allows us to create collection automatically
  // TODO: Modify single migration API to allow create collection
  const migrate = useBulkModulestoreMigrate();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }
  if (migrationTaskId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing migrationId.');
  }

  const {
    data: courseDetails,
    isPending: isPendingCourseDetails,
  } = useCourseDetails(courseId);
  const {
    data: migrationStatusData,
    isPaused: isPendingMigrationStatusData,
  } = useModulestoreMigrationStatus(migrationTaskId, enableRefeshState ? 1000 : false);
  // Get the first migration, because the courses are imported one by one
  const courseImportDetails = migrationStatusData?.parameters?.[0];

  const isPending = isPendingCourseDetails || isPendingMigrationStatusData;

  // Calculate current migration status
  let migrationStatus = 'In Progress';
  if (migrationStatusData?.state === 'Failed') {
    // The entire task has failed
    migrationStatus = 'Failed';
  } else if (migrationStatusData?.state === 'Succeeded') {
    // Currently, bulk migrate is being used to migrate courses because
    // it has the ability to create collections.
    // In bulk migration, the task may succeed, but each migration may fail.
    // This checks whether the course migration has failed.
    // TODO: Update this code when using simple migration
    if (courseImportDetails?.isFailed) {
      migrationStatus = 'Failed';
    } else if (courseImportDetails?.migrationSummary.unsupported !== 0) {
      migrationStatus = 'Partial Succeeded';
    } else {
      migrationStatus = 'Succeeded';
    }
  }

  const {
    data: migrationBlockInfo,
    isPending: isPendingMigrationBlockInfo,
  } = useMigrationBlocksInfo(
    libraryId,
    undefined,
    true,
    migrationTaskId,
    migrationStatus === 'Partial Succeeded',
  );
  // Fetch unsupported blocks usage_key information from meilisearch index.
  const { data: unssupportedBlocksData } = useGetContentHits(
    [
      `usage_key IN [${migrationBlockInfo?.map((block) => `"${block.sourceKey}"`).join(',')}]`,
    ],
    (migrationBlockInfo?.length || 0) > 0,
    ['usage_key', 'block_type', 'display_name'],
    migrationBlockInfo?.length,
    true,
  );
  const unsupportedTableData = useMemo(() => {
    if (!migrationBlockInfo || !unssupportedBlocksData) {
      return [];
    }

    const reasons = migrationBlockInfo.reduce((result, block) => ({
      ...result,
      [block.sourceKey]: block.unsupportedReason || '',
    }), {} as Record<string, string>);

    return unssupportedBlocksData.hits.map(block => ({
      blockName: block.display_name,
      blockType: block.block_type,
      reason: reasons[block.usage_key],
    }));
  }, [migrationBlockInfo, unssupportedBlocksData]);

  if (enableRefeshState && migrationStatus !== 'In Progress') {
    setEnableRefreshState(false);
  }

  const collectionLink = () => {
    let libUrl = `/library/${libraryId}`;
    if (courseImportDetails?.targetCollection?.key) {
      libUrl += `/collection/${courseImportDetails.targetCollection.key}`;
    }
    return libUrl;
  };

  const handleImportCourse = async () => {
    if (!courseId || !courseImportDetails || !courseDetails || !migrationStatusData) {
      return;
    }

    setDisableReimport(true);

    try {
      const newMigrationTask = await migrate.mutateAsync({
        sources: [courseId!],
        target: libraryId,
        createCollections: true,
        repeatHandlingStrategy: 'fork',
        compositionLevel: 'section',
      });
      navigate(`../import/${courseImportDetails.source}/${newMigrationTask.uuid}`);
      setDisableReimport(false);
    } catch (error) {
      showToast(intl.formatMessage(messages.importCourseCompleteFailedToastMessage, {
        courseName: courseDetails.title,
      }));
      setDisableReimport(false);
    }
  };

  const renderBody = () => {
    if (isPending || !courseImportDetails) {
      return <Loading />;
    }

    if (migrationStatus === 'Succeeded') {
      return (
        <Stack gap={3}>
          <Alert variant="success" icon={CheckCircle}>
            <Alert.Heading>
              <FormattedMessage {...messages.importSuccessfulAlertTitle} />
            </Alert.Heading>
            <p>
              <FormattedMessage
                {...messages.importSuccessfulAlertBody}
                values={{
                  courseName: courseDetails?.title,
                  collectionName: courseImportDetails.targetCollection?.title,
                }}
              />
            </p>
          </Alert>
          <h4><FormattedMessage {...messages.importSummaryTitle} /></h4>
          <SummaryCard
            totalBlocks={
              courseImportDetails.migrationSummary.totalBlocks - courseImportDetails.migrationSummary.unsupported
            }
            totalComponents={courseImportDetails.migrationSummary.components}
            sections={courseImportDetails.migrationSummary.sections}
            subsections={courseImportDetails.migrationSummary.subsections}
            units={courseImportDetails.migrationSummary.units}
            unsupportedBlocks={courseImportDetails.migrationSummary.unsupported}
          />
          <p>
            <FormattedMessage
              {...messages.importSuccessfulBody}
              values={{
                courseName: courseDetails?.title,
              }}
            />
          </p>
          <div className="w-100 d-flex justify-content-end">
            <Button
              variant="outline-primary"
              iconAfter={ArrowForward}
              onClick={() => navigate(collectionLink())}
            >
              <FormattedMessage {...messages.viewImportedContentButton} />
            </Button>
          </div>
        </Stack>
      );
    } if (migrationStatus === 'Failed') {
      return (
        <Stack gap={3}>
          <Alert variant="danger" icon={Info}>
            <Alert.Heading>
              <FormattedMessage {...messages.importFailedAlertTitle} />
            </Alert.Heading>
            <p>
              <FormattedMessage
                {...messages.importFailedAlertBody}
                values={{
                  courseName: courseDetails?.title,
                }}
              />
            </p>
          </Alert>
          <h4><FormattedMessage {...messages.importFailedDetailsSectionTitle} /></h4>
          <p>
            <FormattedMessage {...messages.importFailedDetailsSectionBody} />
          </p>
          <div className="w-100 d-flex justify-content-end">
            <Button
              variant="outline-primary"
              iconAfter={ArrowForward}
              onClick={handleImportCourse}
              disabled={disableReimport}
            >
              <FormattedMessage {...messages.importFailedRetryImportButton} />
            </Button>
          </div>
        </Stack>
      );
    } if (migrationStatus === 'Partial Succeeded') {
      const importedSuccessfullyCount = courseImportDetails.migrationSummary.totalBlocks
        - courseImportDetails.migrationSummary.unsupported;

      return (
        <Stack gap={3}>
          <Alert variant="warning" icon={WarningFilled}>
            <Alert.Heading>
              <FormattedMessage {...messages.importPartialAlertTitle} />
            </Alert.Heading>
            <p>
              <FormattedMessage
                {...messages.importPartialAlertBody}
                values={{
                  courseName: courseDetails?.title,
                  collectionName: courseImportDetails.targetCollection?.title,
                }}
              />
            </p>
          </Alert>
          <h4><FormattedMessage {...messages.importSummaryTitle} /></h4>
          <SummaryCard
            totalBlocks={
              courseImportDetails.migrationSummary.totalBlocks - courseImportDetails.migrationSummary.unsupported
            }
            totalComponents={courseImportDetails.migrationSummary.components}
            sections={courseImportDetails.migrationSummary.sections}
            subsections={courseImportDetails.migrationSummary.subsections}
            units={courseImportDetails.migrationSummary.units}
            unsupportedBlocks={courseImportDetails.migrationSummary.unsupported}
          />
          <div>
            <FormattedMessage
              {...messages.importPartialBody}
              values={{
                percentage: Math.floor(
                  (importedSuccessfullyCount * 100) / courseImportDetails.migrationSummary.totalBlocks,
                ),
                courseName: courseDetails?.title,
                p: Paragraph,
              }}
            />
          </div>
          {!isPendingMigrationBlockInfo && unsupportedTableData && (
            <DataTable
              isPaginated
              initialState={{
                pageSize: 10,
              }}
              itemCount={unsupportedTableData.length}
              columns={[
                {
                  Header: intl.formatMessage(messages.importPartialReasonTableBlockName),
                  accessor: 'blockName',

                },
                {
                  Header: intl.formatMessage(messages.importPartialReasonTableBlockType),
                  accessor: 'blockType',
                },
                {
                  Header: intl.formatMessage(messages.importPartialReasonTableReason),
                  accessor: 'reason',
                },
              ]}
              data={unsupportedTableData}
            >
              <DataTable.Table />
              <DataTable.TableFooter />
            </DataTable>
          )}

          <div className="w-100 d-flex justify-content-end">
            <Button
              variant="outline-primary"
              iconAfter={ArrowForward}
              onClick={() => navigate(collectionLink())}
            >
              <FormattedMessage {...messages.viewImportedContentButton} />
            </Button>
          </div>
        </Stack>
      );
    }

    return (
      // In Progress
      <Stack gap={3}>
        <h4><FormattedMessage {...messages.importInProgressTitle} /></h4>
        <p>
          <FormattedMessage
            {...messages.importInProgressBody}
            values={{
              courseName: courseDetails?.title,
            }}
          />
        </p>
        <h4><FormattedMessage {...messages.importSummaryTitle} /></h4>
        <SummaryCard isPending />
        <div className="w-100 d-flex justify-content-end">
          <Button
            variant="outline-primary"
            iconAfter={ArrowForward}
            disabled
          >
            <FormattedMessage {...messages.viewImportedContentButton} />
          </Button>
        </div>
      </Stack>
    );
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet>
          <title>{courseDetails?.title ?? ''} | {process.env.SITE_NAME}</title>
        </Helmet>
        <Header
          number={libraryData?.slug}
          title={libraryData?.title}
          org={libraryData?.org}
          contextId={libraryId}
          isLibrary
          readOnly={readOnly}
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="mt-4 mb-5">
          <div className="px-4 bg-light-200 border-bottom">
            <SubHeader
              title={intl.formatMessage(messages.importDetailsTitle)}
              hideBorder
            />
          </div>
          <Layout xs={[{ span: 9 }, { span: 3 }]}>
            <Layout.Element>
              <div className="mt-4 px-4">
                {renderBody()}
              </div>
            </Layout.Element>
            <Layout.Element>
              <HelpSidebar />
            </Layout.Element>
          </Layout>
        </Container>
      </div>
    </div>
  );
};
