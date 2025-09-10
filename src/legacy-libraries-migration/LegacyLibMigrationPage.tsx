import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Container,
  ModalDialog,
  StatefulButton,
  Stepper,
  useToggle,
} from '@openedx/paragon';
import Header from '@src/header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import type { ContentLibrary } from '@src/library-authoring/data/api';

import messages from './messages';
import { SelectLegacyLibraryView } from './SelectLegacyLibraryView';
import { SelectDestinationView } from './SelectDestinationView';
import { ConfirmationView } from './ConfirmationView';
import { MigrationStepsViewer } from './MigrationStepsViewer';

export type MigrationStep = 'select-libraries' | 'select-destination' | 'confirmation-view';

const ExitModal = ({
  isExitModalOpen,
  closeExitModal,
}: {
  isExitModalOpen: boolean,
  closeExitModal: () => void,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleExit = useCallback(() => {
    navigate('/libraries-v1');
  }, []);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.exitModalTitle)}
      isOpen={isExitModalOpen}
      onClose={closeExitModal}
      isOverflowVisible={false}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.exitModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {intl.formatMessage(messages.exitModalBodyText)}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.exitModalCancelText)}
          </ModalDialog.CloseButton>
          <Button onClick={handleExit}>
            {intl.formatMessage(messages.exitModalConfirmText)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export const LegacyLibMigrationPage = () => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState<MigrationStep>('select-libraries');
  const [isExitModalOpen, openExitModal, closeExitModal] = useToggle(false);
  const [destinationLibrary, setDestination] = useState<ContentLibrary>();
  const [confirmationButtonState, setConfirmationButtonState] = useState('default');

  const handleNext = useCallback(() => {
    switch (currentStep) {
      case 'select-libraries':
        setCurrentStep('select-destination');
        break;
      case 'select-destination':
        setCurrentStep('confirmation-view');
        break;
      case 'confirmation-view':
        setConfirmationButtonState('pending');
        // TODO Call migration API
        break;
      default:
        break;
    }
  }, [currentStep, setCurrentStep]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'select-libraries':
        openExitModal();
        break;
      case 'select-destination':
        setDestination(undefined);
        setCurrentStep('select-libraries');
        break;
      case 'confirmation-view':
        setCurrentStep('select-destination');
        break;
      default:
        break;
    }
  }, [currentStep, setCurrentStep]);

  const isNextDisabled = useCallback(() => {
    switch (currentStep) {
      case 'select-libraries':
        // TODO
        return false;
      case 'select-destination':
        return destinationLibrary === undefined;
      case 'confirmation-view':
        return false;
      default:
        return true;
    }
  }, [currentStep, destinationLibrary]);

  // TODO Set this after implement SelectLegacyLibraryView
  const legacyLibCount = 1;
  const legacyLibs = [
    { title: 'Legacy Lib 1', migratedIn: undefined },
    { title: 'Legacy Lib 2', migratedIn: undefined },
    { title: 'Legacy Lib 3', migratedIn: 'Lib1 Large' },
    { title: 'Legacy Lib 4', migratedIn: undefined },
  ];

  return (
    <>
      <div className="d-flex legacy-library-migration-page">
        <div className="flex-grow-1">
          <Helmet>
            <title>
              {intl.formatMessage(messages.siteTitle)}
            </title>
          </Helmet>
          <Header isHiddenMainMenu />
          <Container className="px-6 mt-5 mb-5">
            <SubHeader
              title={intl.formatMessage(messages.siteTitle)}
            />
            <MigrationStepsViewer currentStep={currentStep} />
            <Stepper activeKey={currentStep}>
              <Stepper.Step eventKey="select-libraries" title="Select Legacy Libraries">
                <SelectLegacyLibraryView />
              </Stepper.Step>
              <Stepper.Step eventKey="select-destination" title="Select Destination">
                <SelectDestinationView
                  destinationId={destinationLibrary?.id}
                  setDestinationId={setDestination}
                  legacyLibCount={legacyLibCount}
                />
              </Stepper.Step>
              <Stepper.Step eventKey="confirmation-view" title="Confirmation">
                <ConfirmationView
                  destination={destinationLibrary}
                  legacyLibraries={legacyLibs}
                />
              </Stepper.Step>
            </Stepper>
            <div className="d-flex justify-content-between">
              <Button variant="outline-primary" onClick={handleBack}>
                {currentStep === 'select-libraries'
                  ? intl.formatMessage(messages.cancel)
                  : intl.formatMessage(messages.back)}
              </Button>
              {currentStep !== 'confirmation-view' ? (
                <Button onClick={handleNext} disabled={isNextDisabled()}>
                  {intl.formatMessage(messages.next)}
                </Button>
              ) : (
                <StatefulButton
                  state={confirmationButtonState}
                  disabledStates={['pending']}
                  labels={{
                    default: intl.formatMessage(messages.confirm),
                    pending: intl.formatMessage(messages.confirm),
                  }}
                  onClick={handleNext}
                />
              )}
            </div>
          </Container>
        </div>
      </div>
      <ExitModal
        isExitModalOpen={isExitModalOpen}
        closeExitModal={closeExitModal}
      />
    </>
  );
};
