import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { thunkActions } from '../../../data/redux';
import BaseModal from '../../../sharedComponents/BaseModal';
import messages from './messages';

export const useVideoList = ({ fetchVideos }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [videos, setVideos] = React.useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    fetchVideos({ onSuccess: setVideos });
  }, []);
  return videos;
};

export const useOnSelectClick = ({ setSelection, videos }) => () => setSelection(videos[0]);

export const SelectVideoModal = ({
  fetchVideos,
  isOpen,
  close,
  setSelection,
}) => {
  const intl = useIntl();
  const videos = useVideoList({ fetchVideos });
  const onSelectClick = useOnSelectClick({
    setSelection,
    videos,
  });

  return (
    <BaseModal
      isOpen={isOpen}
      close={close}
      title={intl.formatMessage(messages.selectVideoModalTitle)}
      confirmAction={<Button variant="primary" onClick={onSelectClick}>Next</Button>}
    >
      {/* Content selection */}
      {videos && (videos.map(
        img => (
          <div key={img.externalUrl}>{img.externalUrl}</div>
        ),
      ))}
    </BaseModal>
  );
};

SelectVideoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setSelection: PropTypes.func.isRequired,
  // redux
  fetchVideos: PropTypes.func.isRequired,
};

export const mapStateToProps = null;
export const mapDispatchToProps = {
  fetchVideos: thunkActions.app.fetchVideos,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectVideoModal);
