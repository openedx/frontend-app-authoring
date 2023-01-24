import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Form, Icon, IconButton,
} from '@edx/paragon';
import { DeleteOutline } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import messages from '../messages';

export const HintRow = ({
  value,
  handleChange,
  handleDelete,
  // inject
  intl,
}) => (
  <div className="hintRow d-flex flex-row flex-nowrap justify-content-end">
    <div className="flex-grow-1">
      <Form.Group>
        <Form.Control
          value={value}
          onChange={handleChange}
          floatingLabel={intl.formatMessage(messages.hintInputLabel)}
        />
      </Form.Group>
    </div>
    <div>
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.settingsDeleteIconAltText)}
        onClick={handleDelete}
        variant="secondary"
      />
    </div>
  </div>
);

HintRow.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(HintRow);
