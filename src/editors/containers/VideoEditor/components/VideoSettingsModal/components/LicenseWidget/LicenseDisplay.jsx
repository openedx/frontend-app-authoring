import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import {
  Card,
  Stack,
  Hyperlink,
} from '@edx/paragon';

import { LicenseLevel, LicenseTypes } from '../../../../../../data/constants/licenses';

import LicenseBlurb from './LicenseBlurb';
import { messages } from './messages';

export const LicenseDisplay = ({
  license,
  details,
  licenseDescription,
  level,
}) => {
  if (license !== LicenseTypes.select) {
    return (
      <Stack gap={3} className="border-primary-100 border-top">
        <FormattedMessage {...messages.displaySubsectionTitle} />
        <Card className="mb-3">
          <Card.Header title={<LicenseBlurb license={license} details={details} />} />
          <Card.Section>{licenseDescription}</Card.Section>
        </Card>
        {level !== LicenseLevel.course ? (
          <Hyperlink destination="https://creativecommons.org/about" target="_blank">
            <FormattedMessage {...messages.viewLicenseDetailsLabel} />
          </Hyperlink>
        ) : null }
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
  licenseDescription: PropTypes.func.isRequired,
};

export default injectIntl(LicenseDisplay);
