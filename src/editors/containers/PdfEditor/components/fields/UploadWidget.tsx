import CollapsibleFormWidget from '@src/editors/containers/VideoEditor/components/VideoSettingsModal/components/CollapsibleFormWidget';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { TextField } from '@src/editors/containers/PdfEditor/components/fields/index';
import { FileInput, useFileInput } from '@src/files-and-videos/generic';
import {
  ActionRow, Dropdown, Icon, IconButton, Button, Stack,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import React, { useState } from 'react';
import { useField } from 'formik';
import ErrorAlert from '@src/editors/sharedComponents/ErrorAlerts/ErrorAlert';
import { useCourseAssetUpload } from '@src/editors/containers/PdfEditor/api';
import type { AxiosResponse } from 'axios';
import messages from './messages';

declare interface UploadWidgetArgs {
  supportedFileFormats: string[],
  urlFieldName: string,
}

/* Widget for uploading a file to the course file store. */
const UploadWidget = ({ supportedFileFormats, urlFieldName }: UploadWidgetArgs) => {
  const intl = useIntl();
  const [manualMode, setManualMode] = useState(false);
  const [urlField, urlFieldMeta, urlFieldControl] = useField(urlFieldName);
  const setSelectedRows = () => undefined;
  const setAddOpen = () => undefined;
  const mutation = useCourseAssetUpload();

  const onAddFile = (files: File[]) => {
    const file = files[0];
    // This is coded as a hard limit for handout uploads elsewhere-- seems like an arbitrary thing
    // to have in the frontend, but if that's how it's done...
    if (file.size > 20_000_000) {
      urlFieldControl.setError(intl.formatMessage(messages.fileTooLarge));
      return;
    }
    mutation.mutateAsync(file).then((result: AxiosResponse<{ asset: { external_url: string } }>) => {
      void urlFieldControl.setValue(result.data.asset.external_url);
    }).catch((error) => {
      urlFieldControl.setError(intl.formatMessage(messages.uploadError));
      throw error;
    }).finally(() => {
      mutation.reset();
    });
  };
  const fileInput = useFileInput({ onAddFile, setSelectedRows, setAddOpen });

  const deriveFileName = (rawName: string) => {
    const segments = rawName.split('/').reverse();
    const name = intl.formatMessage(messages.defaultName);
    for (let segment of segments) {
      // Remove hash
      segment = segment.replace(/#.*/, '');
      // Remove query string
      segment = segment.replace(/[?].*/, '');
      // Remove LMS prefix data
      segment = segment.replace(/.*@/, '');
      if (segment) {
        return segment;
      }
    }
    return name;
  };

  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      isError={!!(urlFieldMeta.error)}
      title="File"
    >
      <ErrorAlert
        dismissError={() => urlFieldControl.setError(undefined)}
        hideHeading
        isError={!!urlFieldMeta.error}
      >
        {urlFieldMeta.error!}
      </ErrorAlert>
      {manualMode && <TextField label="PDF Url" id="pdf-url" name="url" />}
      {!manualMode && (
      <>
        <FileInput supportedFileFormats={supportedFileFormats} fileInput={fileInput} />
        <Stack gap={3}>
          <ActionRow className="border border-gray-300 rounded px-3 py-2">
            {mutation.isPending ? <FormattedMessage {...messages.uploading} /> : deriveFileName(urlField.value)}
            <ActionRow.Spacer />
            <Dropdown>
              <Dropdown.Toggle
                id="dropdown-toggle-with-iconbutton-video-transcript-widget"
                as={IconButton}
                src={MoreHoriz}
                iconAs={Icon}
                variant="primary"
                alt="Actions dropdown"
              />
              <Dropdown.Menu className="video_handout Action Menu">
                <Dropdown.Item
                  key="handout-actions-replace"
                  onClick={fileInput.click}
                >
                  <FormattedMessage {...messages.replaceFile} />
                </Dropdown.Item>
                <Dropdown.Item key="handout-actions-download" target="_blank" href={urlField.value}>
                  <FormattedMessage {...messages.downloadFile} />
                </Dropdown.Item>
                <Dropdown.Item
                  key="handout-actions-manual"
                  onClick={() => setManualMode(true)}
                >
                  <FormattedMessage {...messages.manualUrl} />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ActionRow>
          <FormattedMessage {...messages.fileHint} />
        </Stack>
      </>
      )}
      {manualMode && (
        <ActionRow>
          <Button onClick={() => setManualMode(false)}>
            <FormattedMessage {...messages.easyMode} />
          </Button>
        </ActionRow>
      )}
    </CollapsibleFormWidget>
  );
};

export default UploadWidget;
