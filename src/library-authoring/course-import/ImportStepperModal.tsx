import { useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, ModalDialog, Stepper,
} from '@openedx/paragon';

import { CoursesList } from '@src/studio-home/tabs-section/courses-tab';
import { ReviewImportDetails } from './ReviewImportDetails';
import messages from './messages';

type MigrationStep = 'select-course' | 'review-details';

export const ImportStepperModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean,
  onClose: () => void,
}) => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState<MigrationStep>('select-course');
  const [selectedCourseId, setSelectedCourseId] = useState<string>();

  return (
    <ModalDialog
      title={intl.formatMessage(messages.importCourseModalTitle)}
      isOpen={isOpen}
      onClose={onClose}
      isOverflowVisible={false}
      hasCloseButton
      isBlocking
      size="xl"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage {...messages.importCourseModalTitle} />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Stepper activeKey={currentStep}>
          <Stepper.Header />
          <Stepper.Step
            eventKey="select-course"
            title={intl.formatMessage(messages.importCourseSelectCourseStep)}
          >
            <CoursesList
              selectedCourseId={selectedCourseId}
              handleSelect={setSelectedCourseId}
            />
          </Stepper.Step>
          <Stepper.Step
            eventKey="review-details"
            title={intl.formatMessage(messages.importCourseReviewDetailsStep)}
          >
            <ReviewImportDetails courseId={selectedCourseId} />
          </Stepper.Step>
        </Stepper>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {currentStep === 'select-course' ? (
          <ActionRow className="d-flex justify-content-between">
            <ModalDialog.CloseButton variant="tertiary">
              <FormattedMessage {...messages.importCourseCalcel} />
            </ModalDialog.CloseButton>
            <Button onClick={() => setCurrentStep('review-details')}>
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
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
