import { Form } from '@openedx/paragon';
import CollapsibleFormWidget
  from '@src/editors/sharedComponents/CollapsibleFormWidget/CollapsibleFormWidget';
import { useFormikContext } from 'formik';
import { PdfState } from '@src/editors/containers/PdfEditor/contexts';
import { optional, useUrlValidator } from '@src/editors/utils/validators';
import { useIntl } from '@edx/frontend-platform/i18n';
import CheckboxField from '@src/editors/sharedComponents/CheckboxField';
import TextField from '@src/editors/sharedComponents/TextField';
import messages from './messages';

const DownloadOptions = () => {
  const intl = useIntl();
  const { errors, values } = useFormikContext<PdfState>();
  const isError = !!(errors.allowDownload?.length || errors.sourceText?.length || errors.sourceUrl?.length);
  const urlValidator = optional(useUrlValidator());
  if (values.disableAllDownload) {
    // Download configuration is disabled at the instance-level, so don't even show these options.
    return <></>; // eslint-disable-line react/jsx-no-useless-fragment
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
