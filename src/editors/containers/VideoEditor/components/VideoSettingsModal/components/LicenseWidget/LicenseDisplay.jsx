import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import {
  Stack,
  Hyperlink,
} from '@openedx/paragon';

import { LicenseTypes } from '../../../../../../data/constants/licenses';

import LicenseBlurb from './LicenseBlurb';
import messages from './messages';

const LicenseDisplay = ({
  license,
  details,
  licenseDescription,
}) => {
  if (license !== LicenseTypes.select) {
    return (
      <Stack gap={3}>
        <div className="x-small"><FormattedMessage {...messages.displaySubsectionTitle} /></div>
        <div className="small border border-gray-300 rounded p-4">
          <LicenseBlurb license={license} details={details} />
          <div className="x-small mt-3">{licenseDescription}</div>
        </div>
        {license === LicenseTypes.creativeCommons && (
          <Hyperlink
            className="text-primary-500 x-small"
            destination="https://creativecommons.org/about"
            target="_blank"
          >
            <FormattedMessage {...messages.viewLicenseDetailsLabel} />
          </Hyperlink>
        )}
      </Stack>
    );
  }
  return null;
};

LicenseDisplay.propTypes = {
  license: PropTypes.string.isRequired,
  details: PropTypes.shape({
    attribution: PropTypes.bool.isRequired,
    noncommercial: PropTypes.bool.isRequired,
    noDerivatives: PropTypes.bool.isRequired,
    shareAlike: PropTypes.bool.isRequired,
  }).isRequired,
  level: PropTypes.string.isRequired,
  licenseDescription: PropTypes.string.isRequired,
};

export const LicenseDisplayInternal = LicenseDisplay; // For testing only
export default injectIntl(LicenseDisplay);
