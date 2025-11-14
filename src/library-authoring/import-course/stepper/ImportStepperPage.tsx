import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Chip, Container, Layout, Stepper,
} from '@openedx/paragon';

import { CoursesList, MigrationStatusProps } from '@src/studio-home/tabs-section/courses-tab';
import { useStudioHome } from '@src/studio-home/hooks';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import Loading from '@src/generic/Loading';

import Header from '@src/header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import { useMigrationInfo } from '@src/library-authoring/data/apiHooks';
import { ReviewImportDetails } from './ReviewImportDetails';
import messages from '../messages';
import { HelpSidebar } from '../HelpSidebar';

type MigrationStep = 'select-course' | 'review-details';

export const MigrationStatus = ({
  courseId,
  allVisibleCourseIds,
}: MigrationStatusProps) => {
  const { libraryId } = useLibraryContext();

  const {
    data: migrationInfoData,
  } = useMigrationInfo(allVisibleCourseIds);

  const processedMigrationInfo = useMemo(() => {
    const result = {};
    if (migrationInfoData) {
      for (const libraries of Object.values(migrationInfoData)) {
        // The map key in `migrationInfoData` is in camelCase.
        // In the processed map, we use the key in its original form.
        result[libraries[0].sourceKey] = libraries.map(item => item.targetKey);
      }
    }
    return result;
  }, [migrationInfoData]);

  const isPreviouslyMigrated = (
    courseId in processedMigrationInfo && processedMigrationInfo[courseId].includes(libraryId)
  );

  if (!isPreviouslyMigrated) {
    return null;
  }

  return (
    <div
      key={`${courseId}-${processedMigrationInfo[courseId].join('-')}`}
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
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const { libraryId, libraryData, readOnly } = useLibraryContext();

  // Load the courses list
  // The loading state is handled in `CoursesList`
  useStudioHome();

  if (!libraryData) {
    return <Loading />;
  }

  return (
    <div className="d-flex">
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
        <Container className="mt-4 mb-5">
          <div className="px-4 bg-light-200 border-bottom">
            <SubHeader
              title={intl.formatMessage(messages.importCourseStepperTitle)}
              hideBorder
            />
          </div>
          <Layout xs={[{ span: 9 }, { span: 3 }]}>
            <Layout.Element>
              <Stepper activeKey={currentStep}>
                <Stepper.Header />
                <Stepper.Step
                  eventKey="select-course"
                  title={intl.formatMessage(messages.importCourseSelectCourseStep)}
                >
                  <CoursesList
                    selectedCourseId={selectedCourseId}
                    handleSelect={setSelectedCourseId}
                    cardMigrationStatusWidget={MigrationStatus}
                  />
                </Stepper.Step>
                <Stepper.Step
                  eventKey="review-details"
                  title={intl.formatMessage(messages.importCourseReviewDetailsStep)}
                >
                  <ReviewImportDetails courseId={selectedCourseId} />
                </Stepper.Step>
              </Stepper>
              <div className="mt-4">
                {currentStep === 'select-course' ? (
                  <ActionRow className="d-flex justify-content-between">
                    <Button variant="outline-primary" onClick={() => navigate('../import')}>
                      <FormattedMessage {...messages.importCourseCalcel} />
                    </Button>
                    <Button
                      onClick={() => setCurrentStep('review-details')}
                      disabled={selectedCourseId === undefined}
                    >
                      <FormattedMessage {...messages.importCourseNext} />
                    </Button>
                  </ActionRow>
                ) : (
                  <ActionRow className="d-flex justify-content-between">
                    <Button onClick={() => setCurrentStep('select-course')} variant="tertiary">
                      <FormattedMessage {...messages.importCourseBack} />
                    </Button>
                    <Button disabled>
                      <FormattedMessage {...messages.importCourseButton} />
                    </Button>
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
