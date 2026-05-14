import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { TRANSCRIPT_FAILURE_STATUSES } from '../../../videos-page/data/constants';

const TranscriptColumn = ({ row, handleOpenFileInfo }) => {
  const { transcripts, transcriptionStatus } = row.original;
  const numOfTranscripts = transcripts?.length;
  const transcriptMessage = numOfTranscripts > 0 ? `(${numOfTranscripts}) available` : null;

  return (
    <div className="row m-0 align-items-center">
      {TRANSCRIPT_FAILURE_STATUSES.includes(transcriptionStatus) && (
        <Icon src={Info} size="sm" className="mr-2 text-danger-500" />
      )}
      {numOfTranscripts > 0 && handleOpenFileInfo ? (
        <Button
          variant="link"
          size="inline"
          onClick={(e) => { e.stopPropagation(); handleOpenFileInfo(row.original); }}
        >
          {transcriptMessage}
        </Button>
      ) : (
        <FormattedMessage
          id="course-authoring.videos-page.table.transcriptColumn.message"
          description="Message with the number of transcripts available"
          defaultMessage="{message}"
          values={{ message: transcriptMessage }}
        />
      )}
    </div>
  );
};

TranscriptColumn.propTypes = {
  row: {
    original: {
      transcript: PropTypes.arrayOf([PropTypes.string]).isRequired,
      transcriptionStatus: PropTypes.string.isRequired,
    }.isRequired,
  }.isRequired,
  handleOpenFileInfo: PropTypes.func,
};

TranscriptColumn.defaultProps = {
  handleOpenFileInfo: null,
};

export default TranscriptColumn;
