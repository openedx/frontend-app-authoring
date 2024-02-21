import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Form,
  ButtonGroup,
  Button,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';

import { LICENSE_TYPE } from '../constants';
import messages from './messages';

const LicenseSelector = ({ licenseType, onChangeLicenseType }) => {
  const LICENSE_BUTTON_GROUP_LABELS = {
    [LICENSE_TYPE.allRightsReserved]: {
      label: <FormattedMessage {...messages.licenseChoice1} />,
      tooltip: <FormattedMessage {...messages.licenseTooltip1} />,
    },
    [LICENSE_TYPE.creativeCommons]: {
      label: <FormattedMessage {...messages.licenseChoice2} />,
      tooltip: <FormattedMessage {...messages.licenseTooltip2} />,
    },
  };

  const renderButton = (type) => {
    const isActive = licenseType === type;

    return (
      <OverlayTrigger
        key={type}
        overlay={
          <Tooltip id={`tooltip-${type}`}>{LICENSE_BUTTON_GROUP_LABELS[type].tooltip}</Tooltip>
        }
      >
        <Button
          variant={isActive ? 'primary' : 'outline-primary'}
          onClick={() => onChangeLicenseType(type, 'license')}
        >
          {LICENSE_BUTTON_GROUP_LABELS[type].label}
        </Button>
      </OverlayTrigger>
    );
  };

  return (
    <Form.Group className="p-2 mb-2.5">
      <p className="text-black mb-2.5">
        <FormattedMessage {...messages.licenseType} />
      </p>
      <ButtonGroup className="bg-white">
        {renderButton(LICENSE_TYPE.allRightsReserved)}
        {renderButton(LICENSE_TYPE.creativeCommons)}
      </ButtonGroup>
    </Form.Group>
  );
};

LicenseSelector.defaultProps = {
  licenseType: null,
};

LicenseSelector.propTypes = {
  licenseType: PropTypes.oneOf(Object.values(LICENSE_TYPE)),
  onChangeLicenseType: PropTypes.func.isRequired,
};

export default LicenseSelector;
