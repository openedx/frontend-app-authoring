import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink, Image, Container } from '@openedx/paragon';
import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ProblemTypes, getProblemTypes } from '@src/editors/data/constants/problem';

const Preview = ({
  problemType,
}) => {
  const intl = useIntl();
  if (problemType === null) {
    return null;
  }

  const localizedProblemTypes = getProblemTypes(intl.formatMessage);
  const localizedData = localizedProblemTypes[problemType];
  const staticData = ProblemTypes[problemType];

  return (
    <Container style={{ width: '494px', height: '400px' }} className="bg-light-300 rounded p-4">
      <div className="small">
        {intl.formatMessage(messages.previewTitle, { previewTitle: localizedData.title })}
      </div>
      <Image
        fluid
        className="my-3"
        src={staticData.preview}
        alt={intl.formatMessage(messages.previewAltText, { problemType })}
      />
      <div className="mb-3">
        {intl.formatMessage(messages.previewDescription, { previewDescription: localizedData.previewDescription })}
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
