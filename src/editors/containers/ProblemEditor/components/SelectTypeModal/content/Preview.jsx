import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink, Image } from '@edx/paragon';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ProblemTypes } from '../../../../../data/constants/problem';

export const Preview = ({
  problemType,
  // injected
  intl,
}) => {
  if (problemType === null) {
    return null;
  }
  const data = ProblemTypes[problemType];
  return (
    <div className="bg-light-300 rounded p-4">
      <div className="small">
        {intl.formatMessage(messages.previewTitle, { previewTitle: data.title })}
      </div>
      <Image
        fluid
        className="my-3"
        src={data.preview}
        alt={intl.formatMessage(messages.previewAltText, { problemType })}
      />
      <div className="mb-3">
        {intl.formatMessage(messages.previewDescription, { previewDescription: data.description })}
      </div>
      <Hyperlink
        destination={data.helpLink}
        target="_blank"
      >
        <FormattedMessage {...messages.learnMoreButtonLabel} />
      </Hyperlink>
    </div>
  );
};

Preview.defaultProps = {
  problemType: null,
};

Preview.propTypes = {
  problemType: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(Preview);
