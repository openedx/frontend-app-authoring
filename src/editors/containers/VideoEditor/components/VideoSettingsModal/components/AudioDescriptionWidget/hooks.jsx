import { useDispatch, useSelector } from 'react-redux';
import { useState, useCallback, useMemo } from 'react';
import { thunkActions, selectors } from '../../../../../../data/redux';
import { fileInput as sharedFileInput } from '../../../../../../sharedComponents/FileInput';
import {
  checkValidFileSize,
  checkValidFileType,
} from '../../../../../../sharedComponents/FileInput/fileValidation';

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/x-m4a'];
const ALLOWED_EXTENSIONS = ['.mp3', '.ogg', '.m4a', '.wav', '.aac'];
const DEFAULT_WARNING = { show: false, adDuration: 0, videoDuration: 0 };

const checkAudioDuration = (file, callback) => {
  const url = URL.createObjectURL(file);
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.onloadedmetadata = () => {
    callback(Math.round(audio.duration));
    URL.revokeObjectURL(url);
  };
  audio.onerror = () => {
    URL.revokeObjectURL(url);
  };
  audio.src = url;
};

const parseTimeToSeconds = (timeValue) => {
  if (!timeValue) { return 0; }
  if (typeof timeValue === 'number') { return timeValue; }
  const parts = String(timeValue).split(':').map(Number);
  if (parts.length === 3) { return parts[0] * 3600 + parts[1] * 60 + parts[2]; }
  if (parts.length === 2) { return parts[0] * 60 + parts[1]; }
  return Number(timeValue) || 0;
};

/**
 * Creates the file input handler with audio-specific validation (size + type).
 * Delegates to shared fileInput hook, wrapping with validation before dispatching upload.
 */
export const useFileInput = ({ fileSizeError, fileTypeError, onDurationChecked }) => {
  const dispatch = useDispatch();

  return sharedFileInput({
    onAddFile: (file) => {
      if (!checkValidFileSize({ file, onSizeFail: fileSizeError.set })) { return; }
      if (!checkValidFileType({
        file,
        allowedTypes: ALLOWED_AUDIO_TYPES,
        allowedExtensions: ALLOWED_EXTENSIONS,
        onTypeFail: fileTypeError.set,
      })) { return; }
      if (onDurationChecked) { checkAudioDuration(file, onDurationChecked); }
      dispatch(thunkActions.video.uploadAudioDescription({ file }));
    },
  });
};

/**
 * Hook that manages the duration mismatch warning state.
 * Compares the AD file duration against the video duration from Redux state.
 */
export const useDurationWarning = () => {
  const duration = useSelector(selectors.video.duration);
  const [warning, setWarning] = useState(DEFAULT_WARNING);
  const videoDurationSec = parseTimeToSeconds(duration?.total);

  const onDurationChecked = useCallback((adDurationSec) => {
    if (videoDurationSec > 0 && Math.abs(adDurationSec - videoDurationSec) > 1) {
      setWarning({ show: true, adDuration: adDurationSec, videoDuration: videoDurationSec });
    } else {
      setWarning(DEFAULT_WARNING);
    }
  }, [videoDurationSec]);

  const dismiss = useCallback(() => setWarning(DEFAULT_WARNING), []);

  const durationWarning = useMemo(
    () => ({ ...warning, onDurationChecked, dismiss }),
    [warning, onDurationChecked, dismiss],
  );

  return { durationWarning };
};
