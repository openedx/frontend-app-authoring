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
  }),
  // injected
  intl: intlShape.isRequired,
};

VideoInfoModalSidebar.defaultProps = {
  video: null,
};

export default injectIntl(VideoInfoModalSidebar);
