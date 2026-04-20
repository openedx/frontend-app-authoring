import React from 'react';
import { useFormikContext } from 'formik';
import { PdfState } from '@src/editors/containers/PdfEditor/contexts';
import { optional, useUrlValidator } from '@src/editors/utils/validators';
import { useIntl } from '@edx/frontend-platform/i18n';
import CheckboxField from '@src/editors/sharedComponents/CheckboxField';
import TextField from '@src/editors/sharedComponents/TextField';
import messages from './messages';

const DownloadOptions: React.FC = () => {
  const intl = useIntl();
  const { values } = useFormikContext<PdfState>();
  const urlValidator = optional(useUrlValidator());
  if (values.disableAllDownload) {
    // Download configuration is disabled at the instance-level, so don't even show these options.
    return <></>; // eslint-disable-line react/jsx-no-useless-fragment
  }
  return (
    <>
      <div className="mt-5 mb-4">
        <CheckboxField
          label={intl.formatMessage(messages.allowDownloadLabel)}
          id="pdf-allow-download"
          hint={intl.formatMessage(messages.allowDownloadHint)}
          fieldConfig="allowDownload"
        />
      </div>
      <TextField
        label={intl.formatMessage(messages.sourceUrlLabel)}
        name="sourceUrl"
        id="pdf-source-url"
        hint={intl.formatMessage(messages.sourceUrlHint)}
        fieldConfig={{ validate: urlValidator }}
      />
      <TextField
        label={intl.formatMessage(messages.sourceDocumentButtonTextLabel)}
        id="pdf-source-text"
        placeholder={intl.formatMessage(messages.sourceDocumentButtonTextPlaceholder)}
        name="sourceText"
      />
    </>
  );
};

export default DownloadOptions;
