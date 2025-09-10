import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink, Image, Container } from '@openedx/paragon';
import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ProblemTypes } from '../../../../../data/constants/problem';

const Preview = ({
  problemType,
}) => {
  const intl = useIntl();
  if (problemType === null) {
    return null;
  }

  const staticData = ProblemTypes[problemType];

  return (
    <Container style={{ width: '494px', height: '400px' }} className="bg-light-300 rounded p-4">
      <div className="small">
        <FormattedMessage {...messages[`problemType.${problemType}.title`]} /> {intl.formatMessage(messages.problemTextInPreviewTitle)}
      </div>
      <Image
        fluid
        className="my-3"
        src={staticData.preview}
        alt={intl.formatMessage(messages.previewAltText, { problemType })}
      />
      <div className="mb-3">
        <FormattedMessage {...messages[`problemType.${problemType}.description`]} />
      </div>
      <Hyperlink
        destination={staticData.helpLink}
        target="_blank"
      >
        <FormattedMessage {...messages.learnMoreButtonLabel} />
      </Hyperlink>
    </Container>
  );
};

Preview.defaultProps = {
  problemType: null,
};

Preview.propTypes = {
  problemType: PropTypes.string,
};

export default Preview;
