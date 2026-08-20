import { EditorComponent } from '@src/editors/EditorComponent';
import { useFormikContext } from 'formik';
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from 'react';
import EditorContainer from '@src/editors/containers/EditorContainer';
import { PdfBlockContext, PdfState } from '@src/editors/containers/PdfEditor/contexts';
import { isEqual } from 'lodash';
import DownloadOptions from '@src/editors/containers/PdfEditor/components/sections/DownloadOptions';
import { UploadWidget } from '@src/editors/sharedComponents/UploadWidget';
import { Spinner } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import {FieldSaverArgs} from "@src/editors/sharedComponents/UploadWidget/UploadWidget";
import {usePdfConversion} from "@src/editors/containers/PdfEditor/api";

const EditorWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const intl = useIntl();
  const { isPending, fetchError } = useContext(PdfBlockContext);
  if (fetchError) {
    return (
      <div className="text-center p-6">
        <FormattedMessage {...messages.blockFailed} />
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenReaderText={intl.formatMessage(messages.blockLoading)}
        />
      </div>
    );
  }
  return <>{children}</>; /* eslint-disable-line react/jsx-no-useless-fragment */
};

const PdfEditingModal: React.FC<EditorComponent> = (props) => {
  const intl = useIntl();
  const { fields, blockId, isLibrary } = useContext(PdfBlockContext);
  const originalState = useRef({ ...fields });
  const { values, setValues } = useFormikContext<PdfState>();
  const mutation = usePdfConversion(blockId);

  useEffect(() => {
    // Form is initialized before we get these values, so we have to set them
    // when they arrive.
    void setValues(fields); // eslint-disable-line no-void
  }, [fields]);

  const isDirty = () => isEqual(originalState, values);

  const getContent = () => {
    const settings = { ...values };
    // disableAllDownload is not a setting we control, but a backend flag. Have to remove it or the
    // backend will reject.
    const ignored = ['disableAllDownload', 'conversionAvailable'];
    return Object.fromEntries(Object.entries(settings).filter(([key]) => !ignored.includes(key)));
  };

  const supportedFormats = ['application/pdf'];
  if (values.conversionAvailable) {
    supportedFormats.push(
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.presentation',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/rtf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  }

  const saver = async (args: FieldSaverArgs<string>) => {
    if (!values.conversionAvailable || args.sourceFile.type == 'application/pdf') {
      // No conversion means no swapping of file values-- just set the field value and be done.
      return args.control.setValue(args.value)
    }
    const pdfUrl = await mutation.mutateAsync(args.value)
    await setValues({...values, url: pdfUrl, sourceUrl: args.value})
  }

  return (
    <EditorContainer {...props} isDirty={isDirty} getContent={getContent}>
      <EditorWrapper>
        <div className="mt-2">
          <UploadWidget
            supportedFileFormats={supportedFormats}
            urlFieldName="url"
            label={intl.formatMessage(messages.urlFieldLabel)}
            blockId={blockId}
            isLibrary={isLibrary}
            saveField={saver}
            id="pdf-url"
          />
        </div>
        <DownloadOptions />
      </EditorWrapper>
    </EditorContainer>
  );
};

export default PdfEditingModal;
