import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { TRANSCRIPT_FAILURE_STATUSES } from '../../../videos-page/data/constants';

const TranscriptColumn = ({ row }) => {
  const { transcripts, transcriptionStatus } = row.original;
  const numOfTranscripts = transcripts?.length;
  const transcriptMessage = numOfTranscripts > 0 ? `(${numOfTranscripts}) available` : null;

  return (
    <div className="row m-0 align-items-center">
      {TRANSCRIPT_FAILURE_STATUSES.includes(transcriptionStatus) && (
        <Icon src={Info} size="sm" className="mr-2 text-danger-500" />
      )}
      <FormattedMessage
        id="course-authoring.videos-page.table.transcriptColumn.message"
        description="Message with the number of transcripts available"
        defaultMessage="{message}"
        values={{ message: transcriptMessage }}
      />
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
};

export default injectIntl(TranscriptColumn);
