import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, Stack, CheckboxControl,
} from '@openedx/paragon';

import { LICENSE_COMMONS_OPTIONS } from '../constants';
import messages from './messages';

const LicenseCommonsOptions = ({ licenseDetails, onToggleCheckbox }) => {
  const optionDetails = [
    {
      id: LICENSE_COMMONS_OPTIONS.attribution,
      label: messages.licenseCreativeOptionBYLabel,
      description: messages.licenseCreativeOptionBYDescription,
      disabled: true,
      checked: licenseDetails.attribution,
    },
    {
      id: LICENSE_COMMONS_OPTIONS.nonCommercial,
      label: messages.licenseCreativeOptionNCLabel,
      description: messages.licenseCreativeOptionNCDescription,
      disabled: false,
      checked: licenseDetails.nonCommercial,
    },
    {
      id: LICENSE_COMMONS_OPTIONS.noDerivatives,
      label: messages.licenseCreativeOptionNDLabel,
      description: messages.licenseCreativeOptionNDDescription,
      disabled: false,
      checked: licenseDetails.noDerivatives,
    },
    {
      id: LICENSE_COMMONS_OPTIONS.shareAlike,
      label: messages.licenseCreativeOptionSALabel,
      description: messages.licenseCreativeOptionSADescription,
      disabled: false,
      checked: licenseDetails.shareAlike,
    },
  ];

  const handleCheckboxClick = (option) => {
    if (!option.disabled) {
      onToggleCheckbox(option.id);
    }
  };

  return (
    <div className="p-2 mb-2.5">
      <p className="text-black">
        <FormattedMessage {...messages.licenseCreativeOptionsLabel} />
      </p>
      <p className="small">
        <FormattedMessage {...messages.licenseCreativeOptionsHelpText} />
      </p>
      <Stack gap={1}>
        {optionDetails.map((option) => (
          <Form.Group
            key={option.id}
            className={classNames('license-option', {
              'license-option_clickable': !option.disabled,
            })}
            onClick={() => handleCheckboxClick(option)}
          >
            <ActionRow>
              <CheckboxControl
                checked={option.checked}
                disabled={option.disabled}
                className="p-1"
                readOnly
              />
              <p className="col-2 text-gray-700 pl-0 ml-0">
                <FormattedMessage {...option.label} />
              </p>
              <ActionRow.Spacer />
              <p className="small mt-1 text-gray-700">
                <FormattedMessage {...option.description} />
              </p>
            </ActionRow>
          </Form.Group>
        ))}
      </Stack>
    </div>
  );
};

LicenseCommonsOptions.propTypes = {
  licenseDetails: PropTypes.shape({
    attribution: PropTypes.bool.isRequired,
    nonCommercial: PropTypes.bool.isRequired,
    noDerivatives: PropTypes.bool.isRequired,
    shareAlike: PropTypes.bool.isRequired,
  }).isRequired,
  onToggleCheckbox: PropTypes.func.isRequired,
};

export default LicenseCommonsOptions;
