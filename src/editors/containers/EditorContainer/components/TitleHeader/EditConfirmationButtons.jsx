import React from 'react';
import PropTypes from 'prop-types';

import { IconButtonWithTooltip, ButtonGroup, Icon } from '@openedx/paragon';
import { Check, Close } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

export const EditConfirmationButtons = ({
  updateTitle,
  cancelEdit,
  // injected
  intl,
}) => (
  <ButtonGroup>
    <IconButtonWithTooltip
      tooltipPlacement="left"
      tooltipContent={intl.formatMessage(messages.saveTitleEdit)}
      src={Check}
      iconAs={Icon}
      onClick={updateTitle}
    />
    <IconButtonWithTooltip
      tooltipPlacement="right"
      tooltipContent={intl.formatMessage(messages.cancelTitleEdit)}
      src={Close}
      iconAs={Icon}
      onClick={cancelEdit}
    />
  </ButtonGroup>
);

EditConfirmationButtons.propTypes = {
  updateTitle: PropTypes.func.isRequired,
  cancelEdit: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};
export default injectIntl(EditConfirmationButtons);
