// ts-check
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Dropzone,
  Icon,
  ModalDialog,
  Stack,
  Stepper,
} from '@edx/paragon';
import { Download, Warning } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { useState } from 'react';

import LoadingButton from '../../generic/loading-button';
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
      <Stack gap={3}>
        <p>{intl.formatMessage(messages.importWizardStepExportBody, { br: linebreak })}</p>
        <Stack gap={3} direction="horizontal">
          <Button
            iconBefore={Download}
            variant="outline-primary"
            onClick={() => getTaxonomyExportFile(taxonomy.id, 'csv')}
          >
            {intl.formatMessage(messages.importWizardStepExportCSVButton)}
          </Button>
          <Button
            iconBefore={Download}
            variant="outline-primary"
            onClick={() => getTaxonomyExportFile(taxonomy.id, 'json')}
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

const UploadStep = ({ setFile, importPlanError, setImportPlanError }) => {
  const intl = useIntl();

  const [filePreview, setFilePreview] = useState(null);

  const handleFileLoad = ({ fileData }) => {
    setFile(fileData.get('file'));
    fileData.get('file').text().then((text) => {
      setFilePreview(text);
      setImportPlanError(null);
    });
  };

  return (
    <Stepper.Step eventKey="upload" hasError={importPlanError}>
      <Stack gap={3}>
        <p>{intl.formatMessage(messages.importWizardStepUploadBody, { br: linebreak })}</p>
        <Dropzone
          style={{ height: '200px', padding: 0 }}
          maxSize={100 * 1024 * 1024 /* 100MB */}
          accept={{
            'text/csv': ['.csv'],
            'application/json': ['.json'],
          }}
          onProcessUpload={handleFileLoad}
          inputComponent={
            filePreview && (
              <pre
                style={{
                  height: '200px', width: '100%', overflow: 'scroll', margin: '1rem',
                }}
              >
                {filePreview}
              </pre>
            )
          }
        />
        {importPlanError && <Container className="alert alert-danger">{importPlanError}</Container>}
      </Stack>
    </Stepper.Step>
  );
};

UploadStep.propTypes = {
  taxonomy: TaxonomyProp.isRequired,
  setFile: PropTypes.func.isRequired,
  importPlanError: PropTypes.string,
  setImportPlanError: PropTypes.func.isRequired,
};

UploadStep.defaultProps = {
  importPlanError: null,
};

const PlanStep = ({ importPlan }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="plan">
      <Stack gap={3}>
        {intl.formatMessage(messages.importWizardStepPlanBody, { br: linebreak, changeCount: importPlan?.length })}
        <ul style={{ height: '200px', overflow: 'scroll' }}>
          {importPlan && importPlan.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </Stack>
    </Stepper.Step>
  );
};

PlanStep.propTypes = {
  importPlan: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ConfirmStep = ({ importPlan }) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="confirm">
      {intl.formatMessage(
        messages.importWizardStepConfirmBody,
        { br: linebreak, changeCount: importPlan?.length },
      )}
    </Stepper.Step>
  );
};

ConfirmStep.propTypes = {
  importPlan: PropTypes.arrayOf(PropTypes.string).isRequired,
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
      const planArray = plan
        .split('\n')
        .toSpliced(0, 2) // Removes the header in the first two lines
        .toSpliced(-1) // Removes the empty last line
        .filter((line) => !(line.includes('No changes'))) // Removes the "No changes" lines
        .map((line) => line.split(':')[1].trim()); // Get only the action message
      setImportPlan(planArray);
      setImportPlanError(null);
      setCurrentStep('plan');
    } catch (error) {
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
    } catch (error) {
      setImportPlanError(error.message);
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
            <UploadStep setFile={setFile} importPlanError={importPlanError} setImportPlanError={setImportPlanError} />
            <PlanStep importPlan={importPlan} />
            <ConfirmStep importPlan={importPlan} />
          </ModalDialog.Body>

          <hr className="mx-4" />

          <ModalDialog.Footer>

            <Stepper.ActionRow eventKey="export">
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <Button onClick={() => setCurrentStep('upload')}>
                {intl.formatMessage(messages.importWizardButtonNext)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="upload">
              <Button variant="outline-primary" onClick={() => setCurrentStep('export')}>
                {intl.formatMessage(messages.importWizardButtonPrevious)}
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <LoadingButton disabled={!file} onClick={generatePlan}>
                {intl.formatMessage(messages.importWizardButtonImport)}
              </LoadingButton>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="plan">
              <Button variant="outline-primary" onClick={() => setCurrentStep('upload')}>
                Previous
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <Button onClick={() => setCurrentStep('confirm')}>
                {intl.formatMessage(messages.importWizardButtonContinue)}
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey="confirm">
              <Button variant="outline-primary" onClick={() => setCurrentStep('plan')}>
                Previous
              </Button>
              <Stepper.ActionRow.Spacer />
              <Button variant="tertiary" onClick={close}>
                {intl.formatMessage(messages.importWizardButtonCancel)}
              </Button>
              <LoadingButton onClick={confirmImportTags}>
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
