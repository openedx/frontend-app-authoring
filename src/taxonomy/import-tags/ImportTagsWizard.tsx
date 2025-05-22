import React, { useState, useContext, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  useToggle,
  Button,
  Container,
  Dropzone,
  Icon,
  IconButton,
  ModalDialog,
  Stack,
  Stepper,
  Form,
} from '@openedx/paragon';
import {
  DeleteOutline,
  Download,
  InsertDriveFile,
  Warning,
} from '@openedx/paragon/icons';

import LoadingButton from '../../generic/loading-button';
import { LoadingSpinner } from '../../generic/Loading';
import { getFileSizeToClosestByte } from '../../utils';
import { TaxonomyContext } from '../common/context';
import { getTaxonomyExportFile, apiUrls } from '../data/api';
import { useImportTags, useImportPlan, useImportNewTaxonomy } from '../data/apiHooks';
import messages from './messages';
import { TaxonomyData } from '../data/types';

const linebreak = <> <br /> <br /> </>;

type StepKey = 'export' | 'upload' | 'populate' | 'plan' | 'confirm';

interface TaxonomyProp {
  id: number;
  name: string;
}

interface ExportStepProps {
  taxonomy: TaxonomyProp;
}

const ExportStep: React.FC<ExportStepProps> = ({ taxonomy }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="export" title={intl.formatMessage(messages.importWizardStepperExportStepTitle)}>
      <Stack gap={3} data-testid="export-step">
        <p>{intl.formatMessage(messages.importWizardStepExportBody, { br: linebreak })}</p>
        <Stack gap={3} direction="horizontal">
          <Button
            iconBefore={Download}
            variant="outline-primary"
            onClick={() => getTaxonomyExportFile(taxonomy.id, 'csv')}
            data-testid="export-csv-button"
          >
            {intl.formatMessage(messages.importWizardStepExportCSVButton)}
          </Button>
          <Button
            iconBefore={Download}
            variant="outline-primary"
            onClick={() => getTaxonomyExportFile(taxonomy.id, 'json')}
            data-testid="export-json-button"
          >
            {intl.formatMessage(messages.importWizardStepExportJSONButton)}
          </Button>
        </Stack>
      </Stack>
    </Stepper.Step>
  );
};

interface UploadStepProps {
  file: File | null;
  setFile: (file: File | null) => void;
  importPlanError: string | null;
  reimport?: boolean;
}

const UploadStep: React.FC<UploadStepProps> = ({
  file,
  setFile,
  importPlanError,
  reimport = false,
}) => {
  const intl = useIntl();

  const csvTemplateUrl = (
    <a href={apiUrls.taxonomyTemplate('csv')} download>{intl.formatMessage(messages.csvTemplateTitle)}</a>
  );

  const jsonTemplateUrl = (
    <a href={apiUrls.taxonomyTemplate('json')} download>{intl.formatMessage(messages.jsonTemplateTitle)}</a>
  );

  const handleFileLoad = ({ fileData }: { fileData: FormData }) => {
    const uploadedFile = fileData.get('file') as File;
    setFile(uploadedFile);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <Stepper.Step eventKey="upload" title={intl.formatMessage(messages.importWizardStepperUploadStepTitle)} hasError={!!importPlanError}>
      <Stack gap={3} data-testid="upload-step">
        <p>{
          reimport
            ? intl.formatMessage(messages.importWizardStepReuploadBody, { br: linebreak })
            : intl.formatMessage(
              messages.importWizardStepUploadBody,
              { csvTemplateUrl, jsonTemplateUrl, br: linebreak },
            )
        }
        </p>
        <div>
          {!file ? (
            <Dropzone
              maxSize={100 * 1024 * 1024 /* 100MB */}
              accept={{
                'text/csv': ['.csv'],
                'application/json': ['.json'],
              }}
              onProcessUpload={handleFileLoad}
              data-testid="dropzone"
              /*
                  className is working on Dropzone: https://github.com/openedx/paragon/pull/2950
                  className="h-200px"
              */
              style={{ height: '200px' }}
            />
          ) : (
            <Stack
              gap={3}
              direction="horizontal"
              className="h-200px border-top p-4 align-items-start flex-wrap"
              data-testid="file-info"
            >
              <Icon src={InsertDriveFile} style={{ height: '48px', width: '48px' }} />
              <Stack gap={0} className="align-self-start">
                <div>{file.name}</div>
                <div className="x-small text-gray-500">{getFileSizeToClosestByte(file.size)}</div>
              </Stack>
              <IconButton
                src={DeleteOutline}
                iconAs={Icon}
                alt={intl.formatMessage(messages.importWizardStepUploadClearFile)}
                variant="secondary"
                className="ml-auto"
                onClick={clearFile}
                data-testid="clear-file-button"
              />
            </Stack>
          )}
        </div>

        {importPlanError && <Container className="alert alert-danger">{importPlanError}</Container>}
      </Stack>
    </Stepper.Step>
  );
};

interface TaxonomyPopulateData {
  taxonomyName: string;
  taxonomyDesc: string;
}

interface PopulateStepProps {
  taxonomyPopulateData: TaxonomyPopulateData;
  setTaxonomyPopulateData: (data: TaxonomyPopulateData) => void;
}

const PopulateStep: React.FC<PopulateStepProps> = ({
  taxonomyPopulateData,
  setTaxonomyPopulateData,
}) => {
  const intl = useIntl();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedState = { ...taxonomyPopulateData };
    updatedState.taxonomyName = e.target.value;
    setTaxonomyPopulateData(updatedState);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedState = { ...taxonomyPopulateData };
    updatedState.taxonomyDesc = e.target.value;
    setTaxonomyPopulateData(updatedState);
  };

  return (
    <Stepper.Step eventKey="populate" title={intl.formatMessage(messages.importWizardStepperPopulateStepTitle)}>
      <Stack gap={3} data-testid="populate-step">
        <Form.Group>
          <Form.Label>{ intl.formatMessage(messages.importWizardStepPopulateTaxonomyName) }</Form.Label>
          <Form.Control value={taxonomyPopulateData.taxonomyName} onChange={handleNameChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>{ intl.formatMessage(messages.importWizardStepPopulateTaxonomyDesc) }</Form.Label>
          <Form.Control
            as="textarea"
            autoResize
            value={taxonomyPopulateData.taxonomyDesc}
            onChange={handleDescChange}
          />
        </Form.Group>
      </Stack>
    </Stepper.Step>
  );
};

interface PlanStepProps {
  importPlan: string[] | null;
}

const PlanStep: React.FC<PlanStepProps> = ({ importPlan }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="plan" title={intl.formatMessage(messages.importWizardStepperPlanStepTitle)}>
      <Stack gap={3} data-testid="plan-step">
        {intl.formatMessage(messages.importWizardStepPlanBody, { br: linebreak, changeCount: importPlan?.length })}
        <ul className="h-200px" style={{ overflow: 'scroll' }}>
          {importPlan?.length ? (
            importPlan.map((line) => <li key={line} data-testid="plan-action">{line}</li>)
          ) : (
            <li>{intl.formatMessage(messages.importWizardStepPlanNoChanges)}</li>
          )}
        </ul>
      </Stack>
    </Stepper.Step>
  );
};

interface ConfirmStepProps {
  importPlan: string[] | null;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({ importPlan }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="confirm" title={intl.formatMessage(messages.importWizardStepperConfirmStepTitle)}>
      <Stack data-testid="confirm-step">
        {intl.formatMessage(
          messages.importWizardStepConfirmBody,
          { br: linebreak, changeCount: importPlan?.length },
        )}
      </Stack>
    </Stepper.Step>
  );
};

interface DefaultModalHeaderProps {
  children: string;
}

const DefaultModalHeader: React.FC<DefaultModalHeaderProps> = ({ children }) => (
  <ModalDialog.Header>
    <ModalDialog.Title>{children}</ModalDialog.Title>
  </ModalDialog.Header>
);

interface ImportTagsWizardProps {
  taxonomy?: TaxonomyProp;
  isOpen: boolean;
  onClose: () => void;
  reimport?: boolean;
}

const ImportTagsWizard: React.FC<ImportTagsWizardProps> = ({
  taxonomy,
  isOpen,
  onClose,
  reimport = false,
}) => {
  const intl = useIntl();
  const { setToastMessage, setAlertError } = useContext(TaxonomyContext);

  const [currentStep, setCurrentStep] = useState<StepKey>(reimport ? 'export' : 'upload');

  const [file, setFile] = useState<File | null>(null);

  const [isDialogDisabled, disableDialog, enableDialog] = useToggle(false);

  const [taxonomyPopulateData, setTaxonomyPopulateData] = useState<TaxonomyPopulateData>({
    taxonomyName: '',
    taxonomyDesc: '',
  });

  const importNewTaxonomyMutation = useImportNewTaxonomy();

  const importNewTaxonomy = async () => {
    disableDialog();
    try {
      const { taxonomyName, taxonomyDesc } = taxonomyPopulateData;
      if (file) {
        await importNewTaxonomyMutation.mutateAsync({
          name: taxonomyName,
          description: taxonomyDesc,
          file,
        });
      }
      if (setToastMessage) {
        setToastMessage(intl.formatMessage(messages.importNewTaxonomyToast, { name: taxonomyName }));
      }
    } catch (error: unknown) {
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

  const importPlanResult = useImportPlan(taxonomy?.id, file);

  const importPlan = useMemo(() => {
    if (!importPlanResult.data) {
      return null;
    }
    let planArrayTemp = importPlanResult.data.split('\n');
    planArrayTemp = planArrayTemp.slice(2); // Removes the first two lines
    planArrayTemp = planArrayTemp.slice(0, -1); // Removes the last line
    const planArray = planArrayTemp
      .filter((line) => !(line.includes('No changes'))) // Removes the "No changes" lines
      .map((line) => line.split(':')[1].trim()); // Get only the action message
    return planArray;
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
      if (setToastMessage && taxonomy) {
        setToastMessage(intl.formatMessage(messages.importTaxonomyToast, { name: taxonomy.name }));
      }
    } catch (error: unknown) {
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

  const stepHeaders: Record<StepKey, React.ReactNode> = {
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
    <Container
      onClick={(e) => e.stopPropagation() /* This prevents calling onClick handler from the parent */}
    >
      <ModalDialog
        title=""
        isOpen={isOpen}
        isBlocking
        onClose={onClose}
        size="lg"
        isOverflowVisible
      >
        {(isDialogDisabled) && (
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
              importPlanError={(importPlanResult.error as Error | undefined)?.message || null}
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
              {
                reimport
                && (
                  <Button variant="outline-primary" onClick={() => setCurrentStep('export')} data-testid="back-button">
                    {intl.formatMessage(messages.importWizardButtonPrevious)}
                  </Button>
                )
              }
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={onClose}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              {
                importPlanResult.isLoading ? <LoadingSpinner />
                  : (
                    <LoadingButton
                      label={
                        reimport
                          ? intl.formatMessage(messages.importWizardButtonImport)
                          : intl.formatMessage(messages.importWizardButtonContinue)
                      }
                      disabled={!file || importPlanResult.isLoading || !!importPlanResult.error}
                      onClick={reimport ? generatePlan : populateData}
                    />
                  )
              }
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
              <Button disabled={!importPlan?.length} onClick={() => setCurrentStep('confirm')} data-testid="continue-button">
                {intl.formatMessage(messages.importWizardButtonContinue)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="confirm">
              {
                reimport
                && (
                  <Button variant="outline-primary" onClick={() => setCurrentStep('plan')} data-testid="back-button">
                    {intl.formatMessage(messages.importWizardButtonPrevious)}
                  </Button>
                )
              }
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

export { ImportTagsWizard };