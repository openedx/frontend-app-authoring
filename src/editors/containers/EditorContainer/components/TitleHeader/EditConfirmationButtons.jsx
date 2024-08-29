import React from 'react';
import PropTypes from 'prop-types';

import { IconButtonWithTooltip, ButtonGroup, Icon } from '@openedx/paragon';
import { Check, Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const EditConfirmationButtons = ({
  updateTitle,
  cancelEdit,
}) => {
  const intl = useIntl();
  return (
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
};

EditConfirmationButtons.propTypes = {
  updateTitle: PropTypes.func.isRequired,
  cancelEdit: PropTypes.func.isRequired,
};

export default EditConfirmationButtons;
