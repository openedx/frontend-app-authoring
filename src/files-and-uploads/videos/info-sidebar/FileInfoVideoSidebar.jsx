import React from 'react';
import PropTypes from 'prop-types';
import {
  Tabs,
  Tab,
} from '@edx/paragon';

import InfoTab from './InfoTab';
import TranscriptTab from './TranscriptTab';

const FileInfoVideoSidebar = ({
  video,
}) => (
  <Tabs>
    <Tab eventKey="fileInfo" title="Info">
      <InfoTab {...{ video }} />
    </Tab>
    <Tab eventKey="fileTranscripts" title="Transcripts">
      <TranscriptTab {...{ video }} />
    </Tab>
  </Tabs>
);

FileInfoVideoSidebar.propTypes = {
  video: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    wrapperType: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    dateAdded: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
  }),
};

FileInfoVideoSidebar.defaultProps = {
  video: null,
};

export default FileInfoVideoSidebar;
