import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Stack,
  Icon,
  IconButton,
  Dropdown,
  ActionRow,
} from '@openedx/paragon';
import { FileUpload, MoreHoriz } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../../../../../data/redux';
import * as hooks from './hooks';
import messages from './messages';

import { FileInput } from '../../../../../../sharedComponents/FileInput';
import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import UploadErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/UploadErrorAlert';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import { ErrorContext } from '../../../../hooks';
import { RequestKeys } from '../../../../../../data/constants/requests';

const HandoutWidget = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const isLibrary = useSelector(selectors.app.isLibrary);
  const handout = useSelector(selectors.video.handout);
  const getHandoutDownloadUrl = useSelector(selectors.video.getHandoutDownloadUrl);
  const isUploadError = useSelector((state) => selectors.requests.isFailed(state, {
    requestKey: RequestKeys.uploadAsset,
  }));

  const [error] = useContext(ErrorContext).handout;
  const { fileSizeError } = hooks.fileSizeError();
  const fileInput = hooks.fileInput({ fileSizeError });
  const handoutName = hooks.parseHandoutName({ handout });
  const downloadLink = getHandoutDownloadUrl({ handout });

  const handleDelete = () => {
    dispatch(actions.video.updateField({ handout: null }));
  };

  if (isLibrary) {
    return null;
  }

  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      isError={Object.keys(error).length !== 0}
      title={intl.formatMessage(messages.titleLabel)}
      subtitle={handoutName}
    >
      <ErrorAlert
        dismissError={fileSizeError.dismiss}
        hideHeading
        isError={fileSizeError.show}
      >
        <FormattedMessage {...messages.fileSizeError} />
      </ErrorAlert>
      <UploadErrorAlert isUploadError={isUploadError} message={messages.uploadHandoutError} />
      <FileInput fileInput={fileInput} />
      {handout ? (
        <Stack gap={3}>
          <ActionRow className="border border-gray-300 rounded px-3 py-2">
            {handoutName}
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
                  <FormattedMessage {...messages.replaceHandout} />
                </Dropdown.Item>
                <Dropdown.Item
                  key="handout-actions-download"
                  target="_blank"
                  href={downloadLink}
                >
                  <FormattedMessage {...messages.downloadHandout} />
                </Dropdown.Item>
                <Dropdown.Item key="handout-actions-delete" onClick={handleDelete}>
                  <FormattedMessage {...messages.deleteHandout} />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ActionRow>
          <FormattedMessage {...messages.handoutHelpMessage} />
        </Stack>
      ) : (
        <Stack gap={3}>
          <FormattedMessage {...messages.addHandoutMessage} />
          <Button
            className="text-primary-500 font-weight-bold justify-content-start pl-0"
            size="sm"
            iconBefore={FileUpload}
            onClick={fileInput.click}
            variant="link"
          >
            <FormattedMessage {...messages.uploadButtonLabel} />
          </Button>
        </Stack>
      )}
    </CollapsibleFormWidget>
  );
};

export const HandoutWidgetInternal = HandoutWidget; // For testing
export default HandoutWidget;
