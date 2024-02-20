import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import { LICENSE_TYPE } from '../constants';
import LicenseIcons from '../license-icons';
import messages from './messages';

const LicenseDisplay = ({ licenseType, licenseDetails, licenseURL }) => (
  <Form.Group className="p-2 mb-2.5">
    <p className="text-black mb-2.5">
      <FormattedMessage {...messages.licenseDisplayLabel} />
    </p>
    <p className="small text-gray-700">
      <FormattedMessage {...messages.licenseDisplayParagraph} />
    </p>
    <LicenseIcons
      licenseType={licenseType}
      licenseDetails={licenseDetails}
      licenseURL={licenseURL}
    />
  </Form.Group>
);

LicenseDisplay.defaultProps = {
  licenseURL: '',
  licenseType: null,
  licenseDetails: {},
};

LicenseDisplay.propTypes = {
  licenseType: PropTypes.oneOf(Object.values(LICENSE_TYPE)),
  licenseDetails: PropTypes.shape({
    attribution: PropTypes.bool,
    nonCommercial: PropTypes.bool,
    noDerivatives: PropTypes.bool,
    shareAlike: PropTypes.bool,
  }),
  licenseURL: PropTypes.string,
};

export default LicenseDisplay;
