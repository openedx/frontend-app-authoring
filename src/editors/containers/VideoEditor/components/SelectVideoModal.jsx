import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';

import { thunkActions } from '../../../data/redux';
import BaseModal from '../../../sharedComponents/BaseModal';
import messages from './messages';

export const useVideoList = () => {
  const [videos, setVideos] = React.useState(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(thunkActions.app.fetchVideos({ onSuccess: setVideos }));
  }, [dispatch]);

  return videos;
};

export const useOnSelectClick = ({ setSelection, videos }) => () => {
  if (videos && videos.length > 0) {
    setSelection(videos[0]);
  }
};

export const SelectVideoModal = ({ isOpen, close, setSelection }) => {
  const intl = useIntl();
  const videos = useVideoList();
  const onSelectClick = useOnSelectClick({ setSelection, videos });

  return (
    <BaseModal
      isOpen={isOpen}
      close={close}
      title={intl.formatMessage(messages.selectVideoModalTitle)}
      confirmAction={<Button variant="primary" onClick={onSelectClick}>Next</Button>}
    >
      {videos && videos.map((img) => (
        <div key={img.externalUrl}>{img.externalUrl}</div>
      ))}
    </BaseModal>
  );
};

SelectVideoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setSelection: PropTypes.func.isRequired,
};

export default SelectVideoModal;
