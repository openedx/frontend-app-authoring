import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import TranscriptTab from './TranscriptTab';
import messages from './messages';

const VideoInfoModalSidebar = ({
  video,
}) => {
  const intl = useIntl();

  return (
    <Stack gap={2}>
      <div className="font-weight-bold pb-2 border-bottom border-light-400">
        {intl.formatMessage(messages.transcriptTabTitle, { transcriptCount: video.transcripts.length })}
      </div>
      <TranscriptTab {...{ video }} />
    </Stack>
  );
};

VideoInfoModalSidebar.propTypes = {
  video: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    wrapperType: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    dateAdded: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    transcripts: PropTypes.arrayOf(PropTypes.string),
    transcriptionStatus: PropTypes.string.isRequired,
  }),
};

VideoInfoModalSidebar.defaultProps = {
  video: null,
};

export default VideoInfoModalSidebar;
