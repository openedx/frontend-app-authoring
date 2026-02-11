import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Chip, Container, Layout, OverlayTrigger, Stepper,
  Tooltip,
} from '@openedx/paragon';

import { CoursesList, MigrationStatusProps } from '@src/studio-home/tabs-section/courses-tab';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import Loading from '@src/generic/Loading';

import Header from '@src/header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import { useBulkModulestoreMigrate, usePreviewMigration } from '@src/data/apiHooks';
import { ToastContext } from '@src/generic/toast-context';
import LoadingButton from '@src/generic/loading-button';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import {
  CourseImportFilterProvider,
  useCourseImportFilter,
} from '@src/studio-home/tabs-section/courses-tab/courses-filters/courses-imported-filter-modal/context';
import { ReviewImportDetails } from './ReviewImportDetails';
import messages from '../messages';
import { HelpSidebar } from '../HelpSidebar';

type MigrationStep = 'select-course' | 'review-details';

export const MigrationStatus = ({
  courseId,
}: MigrationStatusProps) => {
  const { libraryId } = useLibraryContext();
  const { processedMigrationInfo } = useCourseImportFilter() || {};

  const isPreviouslyMigrated = processedMigrationInfo?.[courseId]?.includes(libraryId);

  if (!isPreviouslyMigrated) {
    return null;
  }

  return (
    <div
      key={`${courseId}-${processedMigrationInfo?.[courseId].join('-')}`}
      className="previously-migrated-chip"
    >
      <Chip>
        <FormattedMessage {...messages.previouslyImported} />
      </Chip>
    </div>
  );
};

export const ImportStepperPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<MigrationStep>('select-course');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const { data: courseData } = useCourseDetails(selectedCourseId);
  const { libraryId, libraryData, readOnly } = useLibraryContext();
  const { showToast } = useContext(ToastContext);
  // Using bulk migrate as it allows us to create collection automatically
  // TODO: Modify single migration API to allow create collection
  const migrate = useBulkModulestoreMigrate();

  const {
    data: previewMigrationData,
    isPending: isPreviewMigrationPending,
  } = usePreviewMigration(libraryId, selectedCourseId);

  const analysisCompleted = !isPreviewMigrationPending;
  const importIsBlocked = previewMigrationData?.state === 'block_limit_reached';

  const handleImportCourse = async () => {
    // istanbul ignore if: this can never happen, just for satisfying type checker.
    if (!selectedCourseId) {
      return;
    }
    try {
      const migrationTask = await migrate.mutateAsync({
        sources: [selectedCourseId],
        target: libraryId,
        createCollections: true,
        repeatHandlingStrategy: 'fork',
        compositionLevel: 'section',
      });
      navigate(`../import/${selectedCourseId}/${migrationTask.uuid}`);
    } catch (error) {
      showToast(intl.formatMessage(messages.importCourseCompleteFailedToastMessage, {
        courseName: courseData?.title,
      }));
    }
  };

  if (!libraryData) {
    return <Loading />;
  }

  return (
    <div className="import-course-stepper d-flex">
      <div className="flex-grow-1">
        <Helmet>
          <title>{libraryData.title} | {process.env.SITE_NAME}</title>
        </Helmet>
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryId}
          isLibrary
          readOnly={readOnly}
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="mt-4">
          <div className="px-4 bg-light-200 border-bottom">
            <SubHeader
              title={intl.formatMessage(messages.importCourseStepperTitle)}
              hideBorder
            />
          </div>
          <Layout xs={[{ span: 9 }, { span: 3 }]}>
            <Layout.Element>
              <div className="import-container px-4">
                <Stepper activeKey={currentStep}>
                  <Stepper.Header />
                  <Stepper.Step
                    eventKey="select-course"
                    title={intl.formatMessage(messages.importCourseSelectCourseStep)}
                  >
                    <CourseImportFilterProvider
                      selectedCourseId={selectedCourseId}
                      handleSelect={setSelectedCourseId}
                    >
                      <CoursesList
                        selectedCourseId={selectedCourseId}
                        handleSelect={setSelectedCourseId}
                        cardMigrationStatusWidget={MigrationStatus}
                      />
                    </CourseImportFilterProvider>
                  </Stepper.Step>
                  <Stepper.Step
                    eventKey="review-details"
                    title={intl.formatMessage(messages.importCourseReviewDetailsStep)}
                  >
                    <ReviewImportDetails courseId={selectedCourseId} />
                  </Stepper.Step>
                </Stepper>
              </div>
              <div className="content-buttons mt-5 px-5 py-2 bg-white box-shadow-up-1">
                {currentStep === 'select-course' ? (
                  <ActionRow className="d-flex justify-content-between">
                    <Button variant="outline-primary" onClick={() => navigate('../import')}>
                      <FormattedMessage {...messages.importCourseCalcel} />
                    </Button>
                    <Button
                      onClick={() => setCurrentStep('review-details')}
                      disabled={!selectedCourseId}
                    >
                      <FormattedMessage {...messages.importCourseNext} />
                    </Button>
                  </ActionRow>
                ) : (
                  <ActionRow className="d-flex justify-content-between">
                    <Button variant="outline-primary" onClick={() => setCurrentStep('select-course')}>
                      <FormattedMessage {...messages.importCourseBack} />
                    </Button>
                    {importIsBlocked ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={(
                          <Tooltip id="tooltip-import-course-button">
                            <FormattedMessage {...messages.importNotPossibleTooltip} />
                          </Tooltip>
                        )}
                      >
                        <Button variant="primary" disabled>
                          <FormattedMessage {...messages.importCourseButton} />
                        </Button>
                      </OverlayTrigger>
                    ) : (
                      <LoadingButton
                        onClick={handleImportCourse}
                        label={intl.formatMessage(messages.importCourseButton)}
                        variant="primary"
                        disabled={!analysisCompleted}
                      />
                    )}
                  </ActionRow>
                )}
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
