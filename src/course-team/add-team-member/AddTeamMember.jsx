import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Add as IconAdd } from '@openedx/paragon/icons';
import { Button } from '@openedx/paragon';

import messages from './messages';

const AddTeamMember = ({ onFormOpen, isButtonDisable }) => {
  const intl = useIntl();

  return (
    <div className="add-team-member bg-gray-100" data-testid="add-team-member">
      <div className="add-team-member-info">
        <h3 className="add-team-member-title font-weight-bold">{intl.formatMessage(messages.title)}</h3>
        <span className="text-gray-500 small">{intl.formatMessage(messages.description)}</span>
      </div>
      <Button
        variant="primary"
        iconBefore={IconAdd}
        onClick={onFormOpen}
        disabled={isButtonDisable}
      >
        {intl.formatMessage(messages.button)}
      </Button>
    </div>
  );
};

AddTeamMember.propTypes = {
  onFormOpen: PropTypes.func.isRequired,
  isButtonDisable: PropTypes.bool,
};

AddTeamMember.defaultProps = {
  isButtonDisable: false,
};

export default AddTeamMember;
