import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Tabs,
  Tab,
} from '@edx/paragon';
import InfoTab from './InfoTab';
import TranscriptTab from './TranscriptTab';
import messages from './messages';
import { TRANSCRIPT_FAILURE_STATUSES } from '../data/constants';

const VideoInfoModalSidebar = ({
  video,
  // injected
  intl,
}) => (
  <Tabs>
    <Tab eventKey="fileInfo" title={intl.formatMessage(messages.infoTabTitle)}>
      <InfoTab {...{ video }} />
    </Tab>
    <Tab
      eventKey="fileTranscripts"
      title={intl.formatMessage(
        messages.transcriptTabTitle,
        { transcriptCount: video.transcripts.length },
      )}
      notification={TRANSCRIPT_FAILURE_STATUSES.includes(video.transcriptionStatus) && (
        <span>
          <span className="sr-only">{intl.formatMessage(messages.notificationScreenReaderText)}</span>
        </span>
      )}
    >
      <TranscriptTab {...{ video }} />
    </Tab>
  </Tabs>
);

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
  // injected
  intl: intlShape.isRequired,
};

VideoInfoModalSidebar.defaultProps = {
  video: null,
};

export default injectIntl(VideoInfoModalSidebar);
