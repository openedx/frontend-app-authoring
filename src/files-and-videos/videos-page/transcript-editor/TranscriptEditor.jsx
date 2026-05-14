import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  Form,
  Icon,
  IconButton,
  ModalDialog,
  Spinner,
  Stack,
} from '@openedx/paragon';
import {
  Add,
  CheckCircle,
  DeleteOutline,
  Info,
  PlayArrow,
} from '@openedx/paragon/icons';

import { fetchTranscriptContent, uploadTranscript } from '../data/api';
import {
  formatTimestamp,
  parseSrt,
  parseTimestamp,
  serializeSrt,
} from './srtUtils';
import messages from './messages';
import './TranscriptEditor.scss';

const toVttTimestamp = (timestamp) => timestamp.replace(',', '.');
const TIMESTAMP_REGEX = /^\d{2}:\d{2}:\d{2},\d{3}$/;
const hasInvalidCueText = (text = '') => {
  const lines = text.split(/\r?\n/);
  return text.trim().length === 0 || lines.some((line) => line.trim().length === 0);
};

const serializeVtt = (cues) => {
  const body = cues
    .map((cue, index) => `${index + 1}\n${toVttTimestamp(cue.startTime)} --> ${toVttTimestamp(cue.endTime)}\n${cue.text}`)
    .join('\n\n');

  return `WEBVTT\n\n${body}`;
};

const TranscriptEditor = ({
  isOpen,
  onClose,
  video,
  language,
  languages,
  transcriptSettings,
}) => {
  const intl = useIntl();
  const videoRef = useRef(null);
  const cueIdRef = useRef(0);
  const cueTextRefs = useRef({});
  const pendingFocusId = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [cues, setCues] = useState([]);
  const [captionTrackUrl, setCaptionTrackUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [initialCuesSnapshot, setInitialCuesSnapshot] = useState('[]');
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  const attachCueIds = (nextCues) => nextCues.map((cue) => ({
    ...cue,
    id: cue.id ?? `cue-${cueIdRef.current++}`,
  }));

  const serializeComparableCues = (nextCues) => JSON.stringify(nextCues.map((cue) => ({
    startTime: cue.startTime,
    endTime: cue.endTime,
    text: cue.text,
  })));

  const hasUnsavedChanges = useMemo(
    () => serializeComparableCues(cues) !== initialCuesSnapshot,
    [cues, initialCuesSnapshot],
  );

  const hasInvalidCueTextInEditor = useMemo(
    () => cues.some((cue) => hasInvalidCueText(cue.text)),
    [cues],
  );

  const hasInvalidTimestamp = (cue) => (
    !TIMESTAMP_REGEX.test(cue.startTime)
    || !TIMESTAMP_REGEX.test(cue.endTime)
    || parseTimestamp(cue.endTime) <= parseTimestamp(cue.startTime)
  );

  const hasInvalidTimestampsInEditor = useMemo(
    () => cues.some(hasInvalidTimestamp),
    [cues],
  );

  useEffect(() => {
    if (pendingFocusId.current) {
      const el = cueTextRefs.current[pendingFocusId.current];
      if (el) {
        el.focus();
        pendingFocusId.current = null;
      }
    }
  }, [cues]);

  const inlineErrorMessage = saveError;

  useEffect(() => {
    if (!isOpen || !language) {
      return undefined;
    }

    let isMounted = true;
    setLoading(true);
    setSaveError('');
    setIsUnsavedModalOpen(false);
    setCurrentTime(0);
    setSaveStatus('idle');

    fetchTranscriptContent({
      videoId: video.id,
      language,
      apiUrl: transcriptSettings.transcriptDownloadHandlerUrl,
    })
      .then((text) => {
        if (!isMounted) {
          return undefined;
        }
        const parsedCues = parseSrt(text);
        setCues(attachCueIds(parsedCues));
        setInitialCuesSnapshot(serializeComparableCues(parsedCues));
        return undefined;
      })
      .catch(() => {
        if (!isMounted) {
          return undefined;
        }
        setCues([]);
        setInitialCuesSnapshot('[]');
        setSaveError(intl.formatMessage(messages.saveFailedLabel));
        return undefined;
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    language,
    video.id,
    transcriptSettings.transcriptDownloadHandlerUrl,
    intl,
  ]);

  const handleCueChange = (index, value) => {
    setCues(prev => prev.map((cue, cueIndex) => (
      cueIndex === index ? { ...cue, text: value } : cue
    )));
  };

  const handleCueTimeChange = (index, field, value) => {
    const normalized = value
      .replace(/\./g, ',')
      .replace(/[^\d:,]/g, '')
      .slice(0, 12);

    setCues(prev => prev.map((cue, cueIndex) => (
      cueIndex === index ? { ...cue, [field]: normalized } : cue
    )));
  };

  const handleCueTimeBlur = (index, field, value) => {
    const normalized = value.replace(/\./g, ',').trim();
    if (!TIMESTAMP_REGEX.test(normalized)) {
      return;
    }

    setCues(prev => prev.map((cue, cueIndex) => (
      cueIndex === index
        ? { ...cue, [field]: formatTimestamp(parseTimestamp(normalized)) }
        : cue
    )));
  };

  const handleDeleteCue = (index) => {
    setCues(prev => prev.filter((_, cueIndex) => cueIndex !== index));
  };

  const handleInsertCueAfter = (index) => {
    setCues((prev) => {
      // index === -1 means insert as the very first cue (empty list)
      if (index === -1) {
        const newId = `cue-${cueIdRef.current++}`;
        pendingFocusId.current = newId;
        return [{
          id: newId,
          startTime: formatTimestamp(0),
          endTime: formatTimestamp(2),
          text: '',
        }];
      }

      const currentCue = prev[index];
      if (!currentCue) {
        return prev;
      }

      const currentEnd = parseTimestamp(currentCue.endTime);
      const nextStart = prev[index + 1]
        ? parseTimestamp(prev[index + 1].startTime)
        : currentEnd + 2;

      const insertedStart = currentEnd;
      const insertedEnd = nextStart > currentEnd ? Math.min(currentEnd + 2, nextStart) : currentEnd + 2;

      const newId = `cue-${cueIdRef.current++}`;
      pendingFocusId.current = newId;
      const newCue = {
        id: newId,
        startTime: formatTimestamp(insertedStart),
        endTime: formatTimestamp(insertedEnd),
        text: '',
      };

      const updated = [...prev];
      updated.splice(index + 1, 0, newCue);
      return updated;
    });
  };

  const seekTo = (timeCode) => {
    if (videoRef.current) {
      videoRef.current.currentTime = parseTimestamp(timeCode);
      videoRef.current.play();
      setCurrentTime(parseTimestamp(timeCode));
    }
  };

  const handleVideoTimeUpdate = (event) => {
    setCurrentTime(event.currentTarget.currentTime);
  };

  useEffect(() => {
    if (!cues.length) {
      setCaptionTrackUrl('');
      return undefined;
    }

    const vttBlob = new Blob([serializeVtt(cues)], { type: 'text/vtt' });
    const nextUrl = URL.createObjectURL(vttBlob);
    setCaptionTrackUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [cues]);

  useEffect(() => {
    if (saveStatus !== 'saved') {
      return undefined;
    }

    const timerId = setTimeout(() => {
      setSaveStatus('idle');
    }, 5000);

    return () => clearTimeout(timerId);
  }, [saveStatus]);

  const handleSave = async () => {
    const hasInvalidCueTextValue = cues.some((cue) => hasInvalidCueText(cue.text));
    if (hasInvalidCueTextValue) {
      return;
    }

    setSaving(true);
    setSaveStatus('saving');
    setSaveError('');

    try {
      const fileName = `${video.displayName}-${language}.srt`;
      const file = new File([serializeSrt(cues)], fileName, { type: 'text/plain' });

      await uploadTranscript({
        videoId: video.id,
        language,
        newLanguage: language,
        apiUrl: transcriptSettings.transcriptUploadHandlerUrl,
        file,
      });

      setInitialCuesSnapshot(serializeComparableCues(cues));
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('idle');
      setSaveError(intl.formatMessage(messages.saveFailedLabel));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (saving) {
      return;
    }

    if (hasUnsavedChanges) {
      setIsUnsavedModalOpen(true);
      return;
    }

    onClose(false);
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={handleRequestClose}
      hasCloseButton
      title={video.displayName}
      size="xl"
      className="transcript-editor-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <div className="d-flex align-items-start justify-content-between w-100 transcript-editor-modal__header-row">
            <div>
              <h3 className="font-weight-bold h3 mb-0">{video.displayName}</h3>
              <h6 className="small text-gray-700 mt-1">{languages?.[language] || language}</h6>
            </div>
            {saveStatus === 'saving' && (
              <div className="d-inline-flex align-items-center text-gray-700 transcript-editor-modal__save-indicator">
                <Spinner animation="border" size="sm" className="mr-2" screenReaderText={intl.formatMessage(messages.saveInProgressLabel)} />
                <span>{intl.formatMessage(messages.saveInProgressLabel)}</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="d-inline-flex align-items-center text-success transcript-editor-modal__save-indicator">
                <Icon src={CheckCircle} className="mr-2" />
                <span>{intl.formatMessage(messages.savedLabel)}</span>
              </div>
            )}
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body className="px-0 pb-0 d-flex flex-column">
        {inlineErrorMessage && (
          <Alert variant="danger" icon={Info} className="mx-4 mt-3 mb-0 flex-shrink-0">
            {inlineErrorMessage}
          </Alert>
        )}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <Spinner animation="border" screenReaderText={intl.formatMessage(messages.loadingLabel)} />
          </div>
        ) : (
          <>
            {video.downloadLink && (
              <div className="flex-shrink-0 bg-black">
                <video
                  ref={videoRef}
                  src={video.downloadLink}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  onTimeUpdate={handleVideoTimeUpdate}
                  onSeeked={handleVideoTimeUpdate}
                  className="transcript-editor-modal__video"
                >
                  <track
                    key={captionTrackUrl}
                    kind="captions"
                    src={captionTrackUrl || ''}
                    srcLang={language}
                    label={language.toUpperCase()}
                    default
                  />
                </video>
              </div>
            )}

            <div className="transcript-editor-modal__cue-list overflow-auto px-4 pb-2">
              {cues.length === 0 && (
                <div className="d-flex justify-content-center py-4">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    iconBefore={Add}
                    onClick={() => handleInsertCueAfter(-1)}
                  >
                    {intl.formatMessage(messages.insertCueLabel)}
                  </Button>
                </div>
              )}
              {cues.map((cue, index) => {
                const isActive = currentTime >= parseTimestamp(cue.startTime)
                  && currentTime < parseTimestamp(cue.endTime);
                const hasCueTextError = hasInvalidCueText(cue.text);
                return (
                  <Stack key={cue.id ?? `cue-${index}`} gap={2} className={`py-2 transcript-editor-modal__cue-wrapper${isActive ? ' transcript-editor-modal__cue--active' : ''}`}>
                    <Stack direction="horizontal" gap={2} className="transcript-editor-modal__cue-row">
                      <div className="transcript-editor-modal__cue-text-wrap">
                        <Form.Control
                          type="text"
                          value={cue.text}
                          onChange={(e) => handleCueChange(index, e.target.value)}
                          className="transcript-editor-modal__cue-text"
                          isInvalid={hasCueTextError}
                          ref={(el) => {
                            if (el) { cueTextRefs.current[cue.id] = el; } else { delete cueTextRefs.current[cue.id]; }
                          }}
                        />
                        {hasCueTextError && (
                          <Form.Control.Feedback type="invalid" hasIcon={false}>
                            {intl.formatMessage(messages.invalidCueTextLabel)}
                          </Form.Control.Feedback>
                        )}
                      </div>
                      <div className="transcript-editor-modal__time-wrap">
                        <Form.Control
                          size="sm"
                          type="text"
                          value={cue.startTime}
                          className="transcript-editor-modal__time"
                          onChange={(e) => handleCueTimeChange(index, 'startTime', e.target.value)}
                          onBlur={(e) => handleCueTimeBlur(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <span className="transcript-editor-modal__time-sep">→</span>
                      <div className="transcript-editor-modal__time-wrap">
                        <Form.Control
                          size="sm"
                          type="text"
                          value={cue.endTime}
                          className="transcript-editor-modal__time"
                          onChange={(e) => handleCueTimeChange(index, 'endTime', e.target.value)}
                          onBlur={(e) => handleCueTimeBlur(index, 'endTime', e.target.value)}
                        />
                      </div>
                      <IconButton
                        iconAs={Icon}
                        src={PlayArrow}
                        alt={intl.formatMessage(messages.seekCueLabel)}
                        onClick={() => seekTo(cue.startTime)}
                      />
                      <IconButton
                        iconAs={Icon}
                        src={DeleteOutline}
                        alt={intl.formatMessage(messages.deleteCueLabel)}
                        onClick={() => handleDeleteCue(index)}
                      />
                    </Stack>
                    {hasInvalidTimestamp(cue) && (
                      <div className="text-danger small mt-n1">
                        {intl.formatMessage(messages.invalidTimestampLabel)}
                      </div>
                    )}
                    <div className="transcript-editor-modal__insert-divider">
                      <hr className="transcript-editor-modal__insert-divider-line" />
                      <Button
                        variant="light"
                        size="sm"
                        iconBefore={Add}
                        className="transcript-editor-modal__insert-btn"
                        onClick={() => handleInsertCueAfter(index)}
                      >
                        {intl.formatMessage(messages.insertCueLabel)}
                      </Button>
                    </div>
                  </Stack>
                );
              })}
            </div>
          </>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          variant="tertiary"
          onClick={handleRequestClose}
          disabled={saving}
        >
          {intl.formatMessage(messages.cancelButtonLabel)}
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            saving || loading || !hasUnsavedChanges || hasInvalidCueTextInEditor || hasInvalidTimestampsInEditor
          }
        >
          {saving
            ? intl.formatMessage(messages.saveInProgressLabel)
            : intl.formatMessage(messages.saveButtonLabel)}
        </Button>
      </ModalDialog.Footer>

      {isUnsavedModalOpen && (
        <ModalDialog
          isOpen
          size="md"
          onClose={() => setIsUnsavedModalOpen(false)}
        >
          <ModalDialog.Header>
            <ModalDialog.Title>{intl.formatMessage(messages.unsavedModalTitle)}</ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <p>{intl.formatMessage(messages.unsavedModalDescription)}</p>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <Button variant="tertiary" onClick={() => setIsUnsavedModalOpen(false)}>
              {intl.formatMessage(messages.keepEditingButtonLabel)}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsUnsavedModalOpen(false);
                onClose(false);
              }}
            >
              {intl.formatMessage(messages.closeEditorButtonLabel)}
            </Button>
          </ModalDialog.Footer>
        </ModalDialog>
      )}
    </ModalDialog>
  );
};

TranscriptEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  language: PropTypes.string,
  languages: PropTypes.shape({}),
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    downloadLink: PropTypes.string,
  }).isRequired,
  transcriptSettings: PropTypes.shape({
    transcriptDownloadHandlerUrl: PropTypes.string.isRequired,
    transcriptUploadHandlerUrl: PropTypes.string.isRequired,
  }).isRequired,
};

TranscriptEditor.defaultProps = {
  language: '',
  languages: {},
};

export default TranscriptEditor;
