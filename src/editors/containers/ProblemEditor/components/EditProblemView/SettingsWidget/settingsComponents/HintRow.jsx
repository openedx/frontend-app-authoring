import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, Icon, IconButton,
} from '@edx/paragon';
import { DeleteOutline } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import messages from '../messages';

export const HintRow = ({
  value,
  handleChange,
  handleDelete,
  handleEmptyHint,
  // injected
  intl,
}) => (
  <ActionRow className="mb-4">
    <Form.Control
      value={value}
      onChange={handleChange}
      onBlur={handleEmptyHint}
      floatingLabel={intl.formatMessage(messages.hintInputLabel)}
    />
    <ActionRow.Spacer />
    <IconButton
      src={DeleteOutline}
      iconAs={Icon}
      alt={intl.formatMessage(messages.settingsDeleteIconAltText)}
      onClick={handleDelete}
    />
  </ActionRow>
);

HintRow.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEmptyHint: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(HintRow);
