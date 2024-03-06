import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Hyperlink,
  Icon,
} from '@openedx/paragon';
import { CheckCircle, RadioButtonUnchecked } from '@openedx/paragon/icons';
import messages from './messages';

const ChecklistItemBody = ({
  checkId,
  isCompleted,
  updateLink,
  // injected
  intl,
}) => (
  <ActionRow>
    <div className="mr-3" id={`icon=${checkId}`}>
      {isCompleted ? (
        <Icon
          src={CheckCircle}
          className="text-success"
          style={{ height: '32px', width: '32px' }}
          screenReaderText={intl.formatMessage(messages.completedItemLabel)}
        />
      ) : (
        <Icon
          src={RadioButtonUnchecked}
          style={{ height: '32px', width: '32px' }}
          screenReaderText={intl.formatMessage(messages.uncompletedItemLabel)}
        />
      )}
    </div>
    <div>
      <div>
        <FormattedMessage {...messages[`${checkId}ShortDescription`]} />
      </div>
      <div className="small">
        <FormattedMessage {...messages[`${checkId}LongDescription`]} />
      </div>
    </div>
    <ActionRow.Spacer />
    {updateLink && (
      <Hyperlink destination={updateLink}>
        <Button size="sm">
          <FormattedMessage {...messages.updateLinkLabel} />
        </Button>
      </Hyperlink>
    )}
  </ActionRow>
);

ChecklistItemBody.defaultProps = {
  updateLink: null,
};

ChecklistItemBody.propTypes = {
  checkId: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  updateLink: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ChecklistItemBody);
