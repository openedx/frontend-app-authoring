import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { TRANSCRIPT_FAILURE_STATUSES } from '../../../videos-page/data/constants';
import messages from '../../messages';

const TranscriptColumn = ({ row, handleOpenFileInfo = /** @type {((file: any) => void) | null} */ (null) }) => {
  const { transcripts, transcriptionStatus } = row.original;
  const numOfTranscripts = transcripts?.length ?? 0;
  const label = <FormattedMessage {...messages.transcriptCountLabel} values={{ numOfTranscripts }} />;

  return (
    <div className="row m-0 align-items-center">
      {TRANSCRIPT_FAILURE_STATUSES.includes(transcriptionStatus) && (
        <Icon src={Info} size="sm" className="mr-2 text-danger-500" />
      )}
      {handleOpenFileInfo ?
        (
          <Button
            variant="link"
            size="inline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFileInfo(row.original);
            }}
          >
            {label}
          </Button>
        ) :
        label}
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

export default TranscriptColumn;
