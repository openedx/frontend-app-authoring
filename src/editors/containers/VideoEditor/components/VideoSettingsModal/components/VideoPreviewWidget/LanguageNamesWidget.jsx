import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { ClosedCaptionOff, ClosedCaption } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../messages';
import { hooks as transcriptHooks } from '../TranscriptWidget';

const LanguageNamesWidget = ({ transcripts, intl }) => {
  let icon = ClosedCaptionOff;
  const hasTranscripts = transcriptHooks.hasTranscripts(transcripts);
  let message = intl.formatMessage(messages.noTranscriptsAdded);

  if (hasTranscripts) {
    message = transcriptHooks.transcriptLanguages(transcripts, intl);
    icon = ClosedCaption;
  }

  return (
    <div className="d-flex flex-row align-items-center x-small">
      <Icon className="mr-1 text-primary-500" src={icon} />
      <span className="text-gray-700">{message}</span>
    </div>
  );
};

LanguageNamesWidget.propTypes = {
  intl: intlShape.isRequired,
  transcripts: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default injectIntl(LanguageNamesWidget);
