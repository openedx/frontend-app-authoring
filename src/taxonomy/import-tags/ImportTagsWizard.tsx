import React, { useContext, useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  useToggle,
  Button,
  Container,
  Icon,
  ModalDialog,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';

import LoadingButton from '@src/generic/loading-button';
import { LoadingSpinner } from '@src/generic/Loading';
import { TaxonomyContext } from '@src/taxonomy/common/context';
import { TaxonomyType } from '@src/taxonomy/data/constants';
import { useImportNewTaxonomy, useImportPlan, useImportTags } from '@src/taxonomy/data/apiHooks';
import type { TaxonomyData } from '@src/taxonomy/data/types';
import { ConfirmStep } from './steps/ConfirmStep';
import { ExportStep } from './steps/ExportStep';
import { PlanStep } from './steps/PlanStep';
import { PopulateStep } from './steps/PopulateStep';
import { UploadStep } from './steps/UploadStep';
import messages from './messages';
import type { ImportTaxonomy, ImportWizardStep, TaxonomyPopulateData } from './types';

/**
 * The header shown at the top of most of the wizard's steps.
 */
export const DefaultModalHeader = ({ children }: { children: string; }) => (
  <ModalDialog.Header>
    <ModalDialog.Title>{children}</ModalDialog.Title>
  </ModalDialog.Header>
);

interface ImportTagsWizardProps {
  /** The taxonomy to import tags into. Only used (and required) when `reimport` is true. */
  taxonomy?: ImportTaxonomy | null;
  isOpen: boolean;
  onClose: () => void;
  /** True to import tags into `taxonomy`; false to create a new taxonomy from the uploaded file. */
  reimport?: boolean;
  defaultTaxonomyType?: TaxonomyType;
  /** Called with the taxonomy that a "create a new taxonomy" import just created. */
  onImportSuccess?: (taxonomy: TaxonomyData) => void;
}

/**
 * A wizard that imports a taxonomy from a file, either creating a new taxonomy or replacing the
 * tags of an existing one.
 */
export const ImportTagsWizard = ({
  taxonomy = null,
  isOpen,
  onClose,
  reimport = false,
  defaultTaxonomyType = TaxonomyType.Tags,
  onImportSuccess,
}: ImportTagsWizardProps) => {
  const intl = useIntl();
  const { setToastMessage, setAlertError } = useContext(TaxonomyContext);

  const [currentStep, setCurrentStep] = useState<ImportWizardStep>(reimport ? 'export' : 'upload');

  const [file, setFile] = useState<File | null>(null);

  const [isDialogDisabled, disableDialog, enableDialog] = useToggle(false);

  const [taxonomyPopulateData, setTaxonomyPopulateData] = useState<TaxonomyPopulateData>({
    taxonomyName: '',
    taxonomyDesc: '',
    taxonomyType: defaultTaxonomyType,
  });

  const importNewTaxonomyMutation = useImportNewTaxonomy();

  const importNewTaxonomy = async () => {
    disableDialog();
    let newTaxonomy: TaxonomyData | undefined;
    try {
      const { taxonomyName, taxonomyDesc, taxonomyType } = taxonomyPopulateData;
      if (file) {
        newTaxonomy = await importNewTaxonomyMutation.mutateAsync({
          name: taxonomyName,
          description: taxonomyDesc,
          taxonomyType,
          file,
        });
      }
      if (setToastMessage) {
        setToastMessage(intl.formatMessage(messages.importNewTaxonomyToast, { name: taxonomyName }));
      }
    } catch (error) {
      if (setAlertError) {
        setAlertError({
          title: intl.formatMessage(messages.importTaxonomyErrorAlert),
          error,
        });
      }
    } finally {
      enableDialog();
      onClose();
    }

    if (newTaxonomy) {
      onImportSuccess?.(newTaxonomy);
    }
  };

  const importPlanResult = useImportPlan(taxonomy?.id, file);

  const importPlan = useMemo(() => {
    if (!importPlanResult.data) {
      return null;
    }
    let planArrayTemp = importPlanResult.data.split('\n');
    planArrayTemp = planArrayTemp.slice(2); // Removes the first two lines
    planArrayTemp = planArrayTemp.slice(0, -1); // Removes the last line
    return planArrayTemp
      .filter((line) => !(line.includes('No changes'))) // Removes the "No changes" lines
      .map((line) => line.split(':')[1].trim()); // Get only the action message
  }, [importPlanResult.data]);

  const importTagsMutation = useImportTags();

  const generatePlan = React.useCallback(() => {
    setCurrentStep('plan');
  }, []);

  const populateData = React.useCallback(() => {
    setCurrentStep('populate');
  }, []);

  const confirmImportTags = async () => {
    disableDialog();
    try {
      if (file && taxonomy) {
        await importTagsMutation.mutateAsync({
          taxonomyId: taxonomy.id,
          file,
        });
      }
      if (setToastMessage) {
        setToastMessage(intl.formatMessage(messages.importTaxonomyToast, { name: taxonomy?.name }));
      }
    } catch (error) {
      if (setAlertError) {
        setAlertError({
          title: intl.formatMessage(messages.importTaxonomyErrorAlert),
          error,
        });
      }
    } finally {
      enableDialog();
      onClose();
    }
  };

  const stepHeaders: Record<ImportWizardStep, React.ReactNode> = {
    export: (
      <DefaultModalHeader>
        {intl.formatMessage(messages.importWizardStepExportTitle, { name: taxonomy?.name })}
      </DefaultModalHeader>
    ),
    upload: (
      <DefaultModalHeader>
        {intl.formatMessage(messages.importWizardStepUploadTitle)}
      </DefaultModalHeader>
    ),
    populate: (
      <DefaultModalHeader>
        {intl.formatMessage(messages.importWizardStepPopulateTitle)}
      </DefaultModalHeader>
    ),
    plan: (
      <DefaultModalHeader>
        {intl.formatMessage(messages.importWizardStepPlanTitle)}
      </DefaultModalHeader>
    ),
    confirm: (
      <ModalDialog.Header className="bg-warning-100">
        <Stack gap={2} direction="horizontal">
          <Icon src={Warning} className="text-warning" />
          <ModalDialog.Title>
            {intl.formatMessage(messages.importWizardStepConfirmTitle, { changeCount: importPlan?.length })}
          </ModalDialog.Title>
        </Stack>
      </ModalDialog.Header>
    ),
  };

  return (
    <Container onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <ModalDialog
        title=""
        isOpen={isOpen}
        isBlocking
        onClose={onClose}
        size="lg"
        isOverflowVisible
      >
        {isDialogDisabled && (
          // This div is used to prevent the user from interacting with the dialog while the import is happening
          <div className="position-absolute w-100 h-100 d-block zindex-9" />
        )}

        {stepHeaders[currentStep]}

        <hr className="mx-4" />

        <Stepper activeKey={currentStep}>
          <ModalDialog.Body>
            {reimport && taxonomy && <ExportStep taxonomy={taxonomy} />}
            <UploadStep
              file={file}
              setFile={setFile}
              importPlanError={importPlanResult.error?.message}
              reimport={reimport}
            />
            <PopulateStep
              taxonomyPopulateData={taxonomyPopulateData}
              setTaxonomyPopulateData={setTaxonomyPopulateData}
            />
            <PlanStep importPlan={importPlan} />
            <ConfirmStep importPlan={importPlan} />
          </ModalDialog.Body>

          <hr className="mx-4" />

          <ModalDialog.Footer>
            <Stepper.ActionRow eventKey="export">
              <Button variant="tertiary" onClick={onClose} data-testid="cancel-button">
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <Button onClick={() => setCurrentStep('upload')} data-testid="next-button">
                {intl.formatMessage(messages.importWizardButtonNext)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="upload">
              {reimport
                && (
                  <Button variant="outline-primary" onClick={() => setCurrentStep('export')} data-testid="back-button">
                    {intl.formatMessage(messages.importWizardButtonPrevious)}
                  </Button>
                )}
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={onClose}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              {importPlanResult.isLoading ?
                <LoadingSpinner />
                : (
                  <LoadingButton
                    label={reimport
                      ? intl.formatMessage(messages.importWizardButtonImport)
                      : intl.formatMessage(messages.importWizardButtonContinue)}
                    disabled={!file || importPlanResult.isLoading || !!importPlanResult.error}
                    onClick={reimport ? generatePlan : populateData}
                  />
                )}
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="populate">
              <Button variant="outline-primary" onClick={() => setCurrentStep('upload')} data-testid="back-button">
                {intl.formatMessage(messages.importWizardButtonPrevious)}
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={onClose}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <LoadingButton
                label={intl.formatMessage(messages.importWizardButtonImport)}
                disabled={!taxonomyPopulateData.taxonomyName || !taxonomyPopulateData.taxonomyDesc}
                onClick={importNewTaxonomy}
                data-testid="import-button"
              />
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="plan">
              <Button variant="outline-primary" onClick={() => setCurrentStep('upload')} data-testid="back-button">
                {intl.formatMessage(messages.importWizardButtonPrevious)}
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={onClose}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <Button
                disabled={!importPlan?.length}
                onClick={() => setCurrentStep('confirm')}
                data-testid="continue-button"
              >
                {intl.formatMessage(messages.importWizardButtonContinue)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="confirm">
              {reimport
                && (
                  <Button variant="outline-primary" onClick={() => setCurrentStep('plan')} data-testid="back-button">
                    {intl.formatMessage(messages.importWizardButtonPrevious)}
                  </Button>
                )}
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={onClose}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <LoadingButton
                label={intl.formatMessage(messages.importWizardButtonConfirm)}
                onClick={confirmImportTags}
              />
            </Stepper.ActionRow>
          </ModalDialog.Footer>
        </Stepper>
      </ModalDialog>
    </Container>
  );
};
