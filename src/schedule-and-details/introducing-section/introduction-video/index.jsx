import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Card } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import AIButton from '../../../studio-home/ps-course-form/AIButton';
// src\studio-home\ps-course-form\AIButton.jsx
import { useCopilot } from '../../../copilot/CopilotContext';


const IntroductionVideo = ({ intl, introVideo, onChange,editedValues }) => {
  // const embedVideoUrl = introVideo
  //   ? `//www.youtube.com/embed/${introVideo}`
  //   : '';

  const isYouTubeUrl = (value) => {
    if (!value) return false;
    return (
      value.includes('youtube.com') ||
      value.includes('youtu.be') ||
      /^[a-zA-Z0-9_-]{11}$/.test(value)
    );
  };

  const getYouTubeEmbedUrl = (value) => {
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return `https://www.youtube.com/embed/${value}`;
    }

    const match = value.match(
      /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  const isDirectVideoUrl = (value) =>
    /\.(mp4|webm|ogg)$/i.test(value);


  const {
    handleAIButtonClick,
    aiLoading,
    showCopilotIcon,
    openCopilotReview,
    enabledCopilot,
  } = useCopilot();

  return (
    <Form.Group className="form-group-custom">
      <div className="mb-2">
        <Form.Label className='video-title'>
          {intl.formatMessage(messages.courseIntroductionVideoLabel)}
          {showCopilotIcon &&<div className="aibutton">
            {aiLoading.introVideo ?(
              <span style={{
                fontSize: "0.875rem",
                color: "var(--primary)",
                animation: "pulse 1.5s infinite",
              }}>Loading...</span>
            ) : (
              <AIButton
                disabled={!editedValues.description?.trim()}
                onClick={enabledCopilot ? handleAIButtonClick : openCopilotReview}
                fieldName="introVideo"
                fieldValue={introVideo || ''}
              />
            )}
          </div>}
        </Form.Label>
      </div>
      <Card>
        <Card.Body className="embed-video-container">
          <div className="introduction-video">
            {/* <iframe
              title={intl.formatMessage(messages.courseIntroductionVideoLabel)}
              width="618"
              height="350"
              src={embedVideoUrl}
              frameBorder="0"
              allowFullScreen
            /> */}

            {isYouTubeUrl(introVideo) && (
              <iframe
                title={intl.formatMessage(messages.courseIntroductionVideoLabel)}
                width="618"
                height="350"
                src={getYouTubeEmbedUrl(introVideo)}
                frameBorder="0"
                allowFullScreen
              />
            )}

            {isDirectVideoUrl(introVideo) && (
              <video
                controls
              >
                <source src={introVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </Card.Body>
        <Card.Divider />
        <Card.Footer className="p-2.5">
          <Form.Control
            value={introVideo || ''}
            placeholder={intl.formatMessage(messages.courseIntroductionVideoPlaceholder)}
            onChange={(e) => onChange(e.target.value, 'introVideo')}
          />
          <Button
            variant="outline-primary"
            onClick={() => onChange('', 'introVideo')}
            disabled={!introVideo}
          >
            {intl.formatMessage(messages.courseIntroductionVideoDelete)}
          </Button>
        </Card.Footer>
      </Card>
      <Form.Control.Feedback>
        {intl.formatMessage(messages.courseIntroductionVideoHelpText)}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

IntroductionVideo.defaultProps = {
  introVideo: '',
};

IntroductionVideo.propTypes = {
  intl: intlShape.isRequired,
  introVideo: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(IntroductionVideo);
