import React, { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Dropzone,
  Icon,
  IconButton,
  ModalDialog,
  Stack,
  Stepper,
} from '@edx/paragon';
import {
  DeleteOutline,
  Download,
  InsertDriveFile,
  Warning,
} from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import LoadingButton from '../../generic/loading-button';
import { getFileSizeToClosestByte } from '../../utils';
import { getTaxonomyExportFile } from '../data/api';
import { planImportTags, useImportTags } from './data/api';
import messages from './messages';

const linebreak = <> <br /> <br /> </>;

const TaxonomyProp = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});

const ExportStep = ({ taxonomy }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="export">
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

ExportStep.propTypes = {
  taxonomy: TaxonomyProp.isRequired,
};

const UploadStep = ({
  file,
  setFile,
  importPlanError,
  setImportPlanError,
}) => {
  const intl = useIntl();

  const handleFileLoad = ({ fileData }) => {
    setFile(fileData.get('file'));
    setImportPlanError(null);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setImportPlanError(null);
  };

  return (
    <Stepper.Step eventKey="upload" hasError={importPlanError}>
      <Stack gap={3} data-testid="upload-step">
        <p>{intl.formatMessage(messages.importWizardStepUploadBody, { br: linebreak })}</p>
        <div>
          {!file ? (
            <Dropzone
              style={{ height: '200px' }}
              maxSize={100 * 1024 * 1024 /* 100MB */}
              accept={{
                'text/csv': ['.csv'],
                'application/json': ['.json'],
              }}
              onProcessUpload={handleFileLoad}
              data-testid="dropzone"
            />
          ) : (
            <Stack
              gap={3}
              direction="horizontal"
              className="border-top p-4 align-items-start flex-wrap"
              style={{ height: '200px' }}
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

UploadStep.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  }),
  setFile: PropTypes.func.isRequired,
  importPlanError: PropTypes.string,
  setImportPlanError: PropTypes.func.isRequired,
};

UploadStep.defaultProps = {
  file: null,
  importPlanError: null,
};

const PlanStep = ({ importPlan }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="plan">
      <Stack gap={3} data-testid="plan-step">
        {intl.formatMessage(messages.importWizardStepPlanBody, { br: linebreak, changeCount: importPlan?.length })}
        <ul style={{ height: '200px', overflow: 'scroll' }}>
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

PlanStep.propTypes = {
  importPlan: PropTypes.arrayOf(PropTypes.string),
};

PlanStep.defaultProps = {
  importPlan: null,
};

const ConfirmStep = ({ importPlan }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="confirm">
      <Stack data-testid="confirm-step">
        {intl.formatMessage(
          messages.importWizardStepConfirmBody,
          { br: linebreak, changeCount: importPlan?.length },
        )}
      </Stack>
    </Stepper.Step>
  );
};

ConfirmStep.propTypes = {
  importPlan: PropTypes.arrayOf(PropTypes.string),
};

ConfirmStep.defaultProps = {
  importPlan: null,
};

const ImportTagsWizard = ({
  taxonomy,
  isOpen,
  close,
}) => {
  const intl = useIntl();

  const steps = ['export', 'upload', 'plan', 'confirm'];
  const [currentStep, setCurrentStep] = useState(steps[0]);

  const [file, setFile] = useState(null);

  const [importPlan, setImportPlan] = useState(null);
  const [importPlanError, setImportPlanError] = useState(null);

  const importTagsMutation = useImportTags();

  const generatePlan = async () => {
    try {
      const plan = await planImportTags(taxonomy.id, file);
      let planArrayTemp = plan.split('\n');
      planArrayTemp = planArrayTemp.slice(2); // Removes the first two lines
      planArrayTemp = planArrayTemp.slice(0, -1); // Removes the last line
      const planArray = planArrayTemp
        .filter((line) => !(line.includes('No changes'))) // Removes the "No changes" lines
        .map((line) => line.split(':')[1].trim()); // Get only the action message
      setImportPlan(planArray);
      setImportPlanError(null);
      setCurrentStep('plan');
    } catch (/** @type {any} */ error) {
      setImportPlanError(error.message);
    }
  };

  const confirmImportTags = async () => {
    try {
      await importTagsMutation.mutateAsync({
        taxonomyId: taxonomy.id,
        file,
      });
      close();
      // ToDo: show success toast
    } catch (error) {
      // ToDo: show error message
    }
  };

  const stepTitles = {
    export: intl.formatMessage(messages.importWizardStepExportTitle, { name: taxonomy.name }),
    upload: intl.formatMessage(messages.importWizardStepUploadTitle),
    plan: intl.formatMessage(messages.importWizardStepPlanTitle),
    confirm: (
      <Stack gap={2} direction="horizontal">
        <Icon src={Warning} className="text-warning" />
        {intl.formatMessage(messages.importWizardStepConfirmTitle, { changeCount: importPlan?.length })}
      </Stack>
    ),
  };

  return (
    <Container
      onClick={(e) => e.stopPropagation() /* This prevents calling onClick handler from the parent */}
    >
      <ModalDialog
        isOpen={isOpen}
        isBlocking
        onClose={close}
        size="lg"
        data-testid="import-tags-wizard"
      >
        <ModalDialog.Header className={(currentStep === 'confirm') ? 'bg-warning-100' : undefined}>
          <ModalDialog.Title>
            {stepTitles[currentStep]}
          </ModalDialog.Title>
        </ModalDialog.Header>

        <hr className="mx-4" />

        <Stepper activeKey={currentStep}>
          <ModalDialog.Body>
            <ExportStep taxonomy={taxonomy} />
            <UploadStep
              file={file}
              setFile={setFile}
              importPlanError={importPlanError}
              setImportPlanError={setImportPlanError}
            />
            <PlanStep importPlan={importPlan} />
            <ConfirmStep importPlan={importPlan} />
          </ModalDialog.Body>

          <hr className="mx-4" />

          <ModalDialog.Footer>

            <Stepper.ActionRow eventKey="export">
              <Button variant="tertiary" onClick={close} data-testid="cancel-button">
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <Button onClick={() => setCurrentStep('upload')} data-testid="next-button">
                {intl.formatMessage(messages.importWizardButtonNext)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="upload">
              <Button variant="outline-primary" onClick={() => setCurrentStep('export')} data-testid="back-button">
                {intl.formatMessage(messages.importWizardButtonPrevious)}
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <LoadingButton disabled={!file} onClick={generatePlan} data-testid="import-button">
                {intl.formatMessage(messages.importWizardButtonImport)}
              </LoadingButton>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="plan">
              <Button variant="outline-primary" onClick={() => setCurrentStep('upload')} data-testid="back-button">
                {intl.formatMessage(messages.importWizardButtonPrevious)}
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <Button disabled={!importPlan?.length} onClick={() => setCurrentStep('confirm')} data-testid="continue-button">
                {intl.formatMessage(messages.importWizardButtonContinue)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="confirm">
              <Button variant="outline-primary" onClick={() => setCurrentStep('plan')} data-testid="back-button">
                {intl.formatMessage(messages.importWizardButtonPrevious)}
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <LoadingButton onClick={confirmImportTags} data-testid="confirm-button">
                {intl.formatMessage(messages.importWizardButtonConfirm)}
              </LoadingButton>
            </Stepper.ActionRow>

          </ModalDialog.Footer>
        </Stepper>
      </ModalDialog>
    </Container>
  );
};

ImportTagsWizard.propTypes = {
  taxonomy: TaxonomyProp.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default ImportTagsWizard;
