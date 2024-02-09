import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import {
  Card,
  Button,
  IconButton,
  Icon,
  ActionRow,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import { thunkActions } from '../../../../../../data/redux';

import TranscriptActionMenu from './TranscriptActionMenu';
import LanguageSelector from './LanguageSelector';
import * as module from './Transcript';
import messages from './messages';

export const hooks = {
  state: {
  // eslint-disable-next-line react-hooks/rules-of-hooks
    inDeleteConfirmation: (args) => React.useState(args),
  },
  setUpDeleteConfirmation: () => {
    const [inDeleteConfirmation, setInDeleteConfirmation] = module.hooks.state.inDeleteConfirmation(false);
    return {
      inDeleteConfirmation,
      launchDeleteConfirmation: () => setInDeleteConfirmation(true),
      cancelDelete: () => setInDeleteConfirmation(false),
    };
  },
};

export const Transcript = ({
  index,
  language,
  transcriptUrl,
  // redux
  deleteTranscript,
}) => {
  const { inDeleteConfirmation, launchDeleteConfirmation, cancelDelete } = module.hooks.setUpDeleteConfirmation();
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {inDeleteConfirmation
        ? (
          <Card className="mb-2">
            <Card.Header title={(<FormattedMessage {...messages.deleteConfirmationHeader} />)} />
            <Card.Body>
              <Card.Section>
                <FormattedMessage {...messages.deleteConfirmationMessage} />
              </Card.Section>
              <Card.Footer>
                <Button variant="tertiary" className="mb-2 mb-sm-0" onClick={cancelDelete}>
                  <FormattedMessage {...messages.cancelDeleteLabel} />
                </Button>
                <Button
                  variant="danger"
                  className="mb-2 mb-sm-0"
                  onClick={() => {
                    deleteTranscript({ language });
                    // stop showing the card
                    cancelDelete();
                  }}
                >
                  <FormattedMessage {...messages.confirmDeleteLabel} />
                </Button>
              </Card.Footer>
            </Card.Body>
          </Card>
        )
        : (
          <ActionRow>
            <LanguageSelector
              title={index}
              language={language}
            />
            <ActionRow.Spacer />
            { language === '' ? (
              <IconButton
                iconAs={Icon}
                src={DeleteOutline}
                onClick={() => launchDeleteConfirmation()}
              />
            ) : (
              <TranscriptActionMenu
                index={index}
                language={language}
                transcriptUrl={transcriptUrl}
                launchDeleteConfirmation={launchDeleteConfirmation}
              />
            )}
          </ActionRow>
        )}
    </>
  );
};

Transcript.defaultProps = {
  transcriptUrl: undefined,
};

Transcript.propTypes = {
  index: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired,
  transcriptUrl: PropTypes.string,
  deleteTranscript: PropTypes.func.isRequired,
};

export const mapStateToProps = () => ({
});
export const mapDispatchToProps = {
  deleteTranscript: thunkActions.video.deleteTranscript,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Transcript));
