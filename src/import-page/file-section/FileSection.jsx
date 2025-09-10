import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Dropzone } from '@openedx/paragon';

import { IMPORT_STAGES } from '../data/constants';
import {
  getCurrentStage, getError, getFileName, getImportTriggered,
} from '../data/selectors';
import messages from './messages';
import { handleProcessUpload } from '../data/thunks';

const FileSection = ({ courseId }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const importTriggered = useSelector(getImportTriggered);
  const currentStage = useSelector(getCurrentStage);
  const fileName = useSelector(getFileName);
  const { hasError } = useSelector(getError);
  const isShowedDropzone = !importTriggered || currentStage === IMPORT_STAGES.SUCCESS || hasError;

  return (
    <Card>
      <Card.Header
        className="h3 px-3 text-black"
        title={intl.formatMessage(messages.headingTitle)}
        subtitle={fileName && intl.formatMessage(messages.fileChosen, { fileName })}
      />
      <Card.Section className="px-3 pt-2 pb-4">
        {isShowedDropzone
          && (
            <Dropzone
              onProcessUpload={
                ({ fileData, requestConfig, handleError }) => dispatch(handleProcessUpload(
                  courseId,
                  fileData,
                  requestConfig,
                  handleError,
                ))
              }
              accept={{ 'application/x-tar.gz': ['.tar.gz'] }}
              data-testid="dropzone"
              style={{ height: '200px' }}
            />
          )}
      </Card.Section>
    </Card>
  );
};

FileSection.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default FileSection;
