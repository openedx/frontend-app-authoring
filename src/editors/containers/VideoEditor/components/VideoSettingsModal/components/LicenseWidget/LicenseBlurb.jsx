import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import {
  Attribution,
  Copyright,
  Cc,
  Nd,
  Nc,
  Sa,
} from '@openedx/paragon/icons';

import messages from './messages';
import { LicenseTypes } from '../../../../../../data/constants/licenses';

const LicenseBlurb = ({
  license,
  details,
}) => (
  <div className="d-flex flex-row align-items-center mt-2">
    {/* not sure how to handle the edge cases when some of the icons are not displayed */}
    {license === LicenseTypes.allRightsReserved ? <Icon src={Copyright} className="mr-1" style={{ height: '18px', width: '18px' }} /> : null}
    {license === LicenseTypes.creativeCommons ? <Icon src={Cc} className="mr-1" style={{ height: '18px', width: '18px' }} /> : null}
    {details.attribution ? <Icon src={Attribution} className="mr-1 text-primary-300" style={{ height: '18px', width: '18px' }} /> : null}
    {details.noncommercial ? <Icon src={Nc} className="mr-1" style={{ height: '18px', width: '18px' }} /> : null}
    {details.noDerivatives ? <Icon src={Nd} className="mr-1" style={{ height: '18px', width: '18px' }} /> : null}
    {details.shareAlike ? <Icon src={Sa} className="mr-1" style={{ height: '18px', width: '18px' }} /> : null}
    {license === LicenseTypes.allRightsReserved
      ? <div className="small mx-1.5"><FormattedMessage {...messages.allRightsReservedIconsLabel} /></div>
      : null}
    {license === LicenseTypes.creativeCommons
      ? <div className="small mx-1.5"><FormattedMessage {...messages.creativeCommonsIconsLabel} /></div>
      : null}
  </div>
);

LicenseBlurb.propTypes = {
  license: PropTypes.string.isRequired,
  details: PropTypes.shape({
    attribution: PropTypes.bool.isRequired,
    noncommercial: PropTypes.bool.isRequired,
    noDerivatives: PropTypes.bool.isRequired,
    shareAlike: PropTypes.bool.isRequired,
  }).isRequired,
};

export const LicenseBlurbInternal = LicenseBlurb; // For testing only
export default injectIntl(LicenseBlurb);
