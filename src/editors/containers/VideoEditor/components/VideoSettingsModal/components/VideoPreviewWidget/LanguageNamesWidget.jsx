import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { ClosedCaptionOff, ClosedCaption } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../messages';
import { hooks as transcriptHooks } from '../TranscriptWidget';

export const LanguageNamesWidget = ({ transcripts, intl }) => {
  let icon = ClosedCaptionOff;
  const hasTranscripts = transcriptHooks.hasTranscripts(transcripts);
  let message = intl.formatMessage(messages.noTranscriptsAdded);
  let fontClass = 'text-gray';

  if (hasTranscripts) {
    message = transcriptHooks.transcriptLanguages(transcripts, intl);
    fontClass = 'text-primary';
    icon = ClosedCaption;
  }

  return (
    <div className="d-flex flex-row align-items-center x-small">
      <Icon className="mr-1" src={icon} />
      <span className={fontClass}>{message}</span>
    </div>
  );
};

LanguageNamesWidget.propTypes = {
  intl: intlShape.isRequired,
  transcripts: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default injectIntl(LanguageNamesWidget);
