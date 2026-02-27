import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { FileInput, useFileInput } from '@src/files-and-videos/generic';
import {
  ActionRow, Dropdown, Icon, IconButton, Button, Stack, Form, Col,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import React, { useState } from 'react';
import { useField } from 'formik';
import type { AxiosResponse } from 'axios';
import TextField from '@src/editors/sharedComponents/TextField';
import { useCourseAssetUpload } from '@src/editors/api';
import defaultMessages from './messages';

export interface UploadWidgetProps {
  id: string,
  label: string,
  supportedFileFormats?: string | string[] | Record<string, string[]>,
  urlFieldName: string,
  messages?: typeof defaultMessages
}

/* Widget for uploading a file to the course file store. */
const UploadWidget = ({
  id,
  label,
  supportedFileFormats,
  urlFieldName,
  messages = defaultMessages,
}: UploadWidgetProps) => {
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
      void urlFieldControl.setValue(result.data.asset.external_url); // eslint-disable-line no-void
    }).catch(() => {
      urlFieldControl.setError(intl.formatMessage(messages.uploadError));
    }).finally(() => {
      mutation.reset();
    });
  };
  const fileInput = useFileInput({ onAddFile, setSelectedRows, setAddOpen });

  const deriveFileName = (rawName: string) => {
    const segments = rawName.split('/').reverse();
    const defaultName = intl.formatMessage(messages.defaultName);
    let segment = segments[0] || '';
    // Remove hash
    segment = segment.replace(/#.*/, '');
    // Remove query string
    segment = segment.replace(/[?].*/, '');
    // Remove LMS prefix data
    segment = segment.replace(/.*@/, '');
    return segment || defaultName;
  };

  return (
    <Form.Group as={Col} controlId={id}>
      {manualMode && <TextField label={intl.formatMessage(messages.urlFieldLabel)} id={id} name="url" />}
      {!manualMode && (
      <>
        <Form.Label htmlFor={id}>{label}</Form.Label>
        <Form.Control.Feedback><FormattedMessage {...messages.fileHint} /></Form.Control.Feedback>
        <FileInput supportedFileFormats={supportedFileFormats} fileInput={fileInput} id={id} />
        <Stack gap={3}>
          <ActionRow className="border border-gray-300 rounded px-3 py-2">
            {mutation.isPending ? <FormattedMessage {...messages.uploading} /> : deriveFileName(urlField.value)}
            <ActionRow.Spacer />
            <Dropdown>
              <Dropdown.Toggle
                id={`dropdown-toggle-with-iconbutton-${urlFieldName}-widget`}
                as={IconButton}
                src={MoreHoriz}
                iconAs={Icon}
                variant="primary"
                alt={intl.formatMessage(messages.actionsDropdown)}
              />
              <Dropdown.Menu className="asset_download Action Menu">
                <Dropdown.Item
                  key="asset-actions-replace"
                  onClick={fileInput.click}
                >
                  <FormattedMessage {...messages.replaceFile} />
                </Dropdown.Item>
                <Dropdown.Item key="asset-actions-download" target="_blank" href={urlField.value}>
                  <FormattedMessage {...messages.downloadFile} />
                </Dropdown.Item>
                <Dropdown.Item
                  key="asset-actions-manual"
                  onClick={() => setManualMode(true)}
                >
                  <FormattedMessage {...messages.manualUrl} />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ActionRow>
          {urlFieldMeta.error && <Form.Control.Feedback type="invalid">{urlFieldMeta.error}</Form.Control.Feedback>}
        </Stack>
      </>
      )}
      {manualMode && (
        <ActionRow>
          <Button onClick={() => setManualMode(false)}>
            <FormattedMessage {...messages.simpleMode} />
          </Button>
        </ActionRow>
      )}
    </Form.Group>
  );
};

export default UploadWidget;
