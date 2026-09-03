import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Dropzone,
  Icon,
  IconButton,
  Stack,
  Stepper,
} from '@openedx/paragon';
import {
  DeleteOutline,
  InsertDriveFile,
} from '@openedx/paragon/icons';

import { apiUrls } from '@src/taxonomy/data/api';
import { getFileSizeToClosestByte } from '@src/utils';
import messages from '../messages';

const csvLink = (chunks) => <a href={apiUrls.taxonomyTemplate('csv')} download>{chunks}</a>;

const jsonLink = (chunks) => <a href={apiUrls.taxonomyTemplate('json')} download>{chunks}</a>;

interface UploadStepProps {
  file: File | null;
  setFile: (file: File | null) => void;
  /** Error that occurred while previewing the import, if any. */
  importPlanError?: string;
  /** True when importing into an existing taxonomy, rather than creating a new one. */
  reimport?: boolean;
}

/**
 * Wizard step where the user selects the file to import.
 */
export const UploadStep = ({
  file,
  setFile,
  importPlanError,
  reimport = false,
}: UploadStepProps) => {
  const intl = useIntl();

  const handleFileLoad = ({ fileData }: { fileData: FormData; }) => {
    setFile(fileData.get('file') as File);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <Stepper.Step
      eventKey="upload"
      title={intl.formatMessage(messages.importWizardStepperUploadStepTitle)}
      hasError={!!importPlanError}
    >
      <Stack gap={3} data-testid="upload-step">
        <p className="mb-0">
          {reimport
            ? <FormattedMessage {...messages.importWizardStepReuploadFormatInfo} />
            : (
              <FormattedMessage
                {...messages.importWizardStepUploadFormatInfo}
                values={{
                  csvTemplateTitle: intl.formatMessage(messages.csvTemplateTitle),
                  jsonTemplateTitle: intl.formatMessage(messages.jsonTemplateTitle),
                  csvLink,
                  jsonLink,
                }}
              />
            )}
        </p>
        <p className="mb-0">
          <FormattedMessage {...messages.importWizardStepUploadDropInstruction} />
        </p>
        <div>
          {!file ?
            (
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
            ) :
            (
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
