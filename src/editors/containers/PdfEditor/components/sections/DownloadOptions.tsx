import { Form } from '@openedx/paragon';
import CollapsibleFormWidget
  from '@src/editors/containers/VideoEditor/components/VideoSettingsModal/components/CollapsibleFormWidget';
import { CheckboxField, TextField } from '@src/editors/containers/PdfEditor/components/fields';
import { useFormikContext } from 'formik';
import { PdfState } from '@src/editors/containers/PdfEditor/contexts';
import { optional, useUrlValidator } from '@src/editors/containers/PdfEditor/components/fields/validators';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const DownloadOptions = () => {
  const intl = useIntl();
  const { errors, values } = useFormikContext<PdfState>();
  const isError = !!(errors.allowDownload?.length || errors.sourceText?.length || errors.sourceUrl?.length);
  const urlValidator = optional(useUrlValidator());
  if (values.disableAllDownload) {
    // Download configuration is disabled at the instance-level, so don't even show these options.
    return <></>;
  }
  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      title={intl.formatMessage(messages.downloadOptions)}
      isError={isError}
    >
      <Form.Group>
        <CheckboxField
          label={intl.formatMessage(messages.allowDownloadLabel)}
          id="pdf-allow-download"
          hint={intl.formatMessage(messages.allowDownloadHint)}
          fieldConfig="allowDownload"
        />
        <TextField
          label={intl.formatMessage(messages.sourceDocumentButtonTextLabel)}
          id="pdf-source-text"
          placeholder={intl.formatMessage(messages.sourceDocumentButtonTextPlaceholder)}
          name="sourceText"
          disabled={!values.allowDownload}
        />
        <TextField
          label={intl.formatMessage(messages.sourceUrlLabel)}
          name="sourceUrl"
          id="pdf-source-url"
          hint={intl.formatMessage(messages.sourceUrlHint)}
          disabled={!values.allowDownload}
          fieldConfig={{ validate: urlValidator }}
        />
      </Form.Group>
    </CollapsibleFormWidget>
  );
};

export default DownloadOptions;
