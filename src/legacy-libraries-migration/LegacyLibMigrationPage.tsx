import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Container,
  Layout,
  ModalDialog,
  StatefulButton,
  Stepper,
  useToggle,
} from '@openedx/paragon';
import Header from '@src/header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import type { ContentLibrary } from '@src/library-authoring/data/api';
import type { LibraryV1Data } from '@src/studio-home/data/api';
import LibrariesList from '@src/studio-home/tabs-section/libraries-tab';

import messages from './messages';
import { SelectDestinationView } from './SelectDestinationView';
import { ConfirmationView } from './ConfirmationView';
import { LegacyMigrationHelpSidebar } from './LegacyMigrationHelpSidebar';

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
          <FormattedMessage {...messages.exitModalTitle} />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <FormattedMessage {...messages.exitModalBodyText} />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage {...messages.exitModalCancelText} />
          </ModalDialog.CloseButton>
          <Button onClick={() => navigate('/libraries-v1')}>
            <FormattedMessage {...messages.exitModalConfirmText} />
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
  const [legacyLibraries, setLegacyLibraries] = useState<LibraryV1Data[]>([]);
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
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        break;
    }
  }, [currentStep, setCurrentStep]);

  const isNextDisabled = useCallback(() => {
    switch (currentStep) {
      case 'select-libraries':
        return legacyLibraries.length === 0;
      case 'select-destination':
        return destinationLibrary === undefined;
      case 'confirmation-view':
        /* istanbul ignore next */
        return false;
      default:
        /* istanbul ignore next */
        return true;
    }
  }, [legacyLibraries, currentStep, destinationLibrary]);

  const handleUpdateLegacyLibraries = useCallback((library: LibraryV1Data, action: 'add' | 'remove') => {
    if (action === 'add') {
      setLegacyLibraries([...legacyLibraries, library]);
    } else {
      setLegacyLibraries(legacyLibraries.filter(item => item.libraryKey !== library.libraryKey));
    }
  }, [legacyLibraries, setLegacyLibraries]);

  const legacyLibrariesIds = useMemo(() => legacyLibraries.map(item => item.libraryKey), [legacyLibraries]);

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.siteTitle)}
        </title>
      </Helmet>
      <Header isHiddenMainMenu />
      <div className="legacy-library-migration-page">
        <Layout
          lg={[{ span: 9 }, { span: 3 }]}
          md={[{ span: 9 }, { span: 3 }]}
          sm={[{ span: 9 }, { span: 3 }]}
          xs={[{ span: 9 }, { span: 3 }]}
          xl={[{ span: 9 }, { span: 3 }]}
        >
          <Layout.Element>
            <div className="flex-fill">
              <Container className="migration-container d-flex flex-column px-6 mt-5 mb-5">
                <div className="migration-content">
                  <SubHeader
                    title={intl.formatMessage(messages.siteTitle)}
                  />
                  <Stepper activeKey={currentStep}>
                    <Stepper.Header />
                    <Stepper.Step
                      eventKey="select-libraries"
                      title={intl.formatMessage(messages.selectLegacyLibrariesStepTitle)}
                    >
                      <LibrariesList
                        selectedIds={legacyLibrariesIds}
                        handleCheck={handleUpdateLegacyLibraries}
                        hideMigationAlert
                      />
                    </Stepper.Step>
                    <Stepper.Step
                      eventKey="select-destination"
                      title={intl.formatMessage(messages.selectDestinationStepTitle)}
                    >
                      <SelectDestinationView
                        destinationId={destinationLibrary?.id}
                        setDestinationId={setDestination}
                        legacyLibCount={legacyLibraries.length}
                      />
                    </Stepper.Step>
                    <Stepper.Step
                      eventKey="confirmation-view"
                      title={intl.formatMessage(messages.confirmStepTitle)}
                    >
                      {destinationLibrary && (
                        <ConfirmationView
                          destination={destinationLibrary}
                          legacyLibraries={legacyLibraries}
                        />
                      )}
                    </Stepper.Step>
                  </Stepper>
                </div>
                <div className="content-buttons d-flex justify-content-between">
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
          </Layout.Element>
          <Layout.Element>
            <LegacyMigrationHelpSidebar />
          </Layout.Element>
        </Layout>
      </div>
      <ExitModal
        isExitModalOpen={isExitModalOpen}
        closeExitModal={closeExitModal}
      />
    </>
  );
};
