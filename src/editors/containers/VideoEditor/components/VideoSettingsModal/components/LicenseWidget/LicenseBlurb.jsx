import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import {
  Attribution,
  Copyright,
  Cc,
  Nd,
  Nc,
  Sa,
} from '@edx/paragon/icons';

import messages from './messages';
import { LicenseTypes } from '../../../../../../data/constants/licenses';

export const LicenseBlurb = ({
  license,
  details,
}) => (
  <div className="d-flex flex-row flex-row">
    {license === LicenseTypes.allRightsReserved ? <Icon src={Copyright} /> : null}
    {license === LicenseTypes.creativeCommons ? <Icon src={Cc} /> : null}
    {details.attribution ? <Icon src={Attribution} /> : null}
    {details.noncommercial ? <Icon src={Nc} /> : null}
    {details.noDerivatives ? <Icon src={Nd} /> : null}
    {details.shareAlike ? <Icon src={Sa} /> : null}
    {license === LicenseTypes.allRightsReserved
      ? <div><FormattedMessage {...messages.allRightsReservedIconsLabel} /></div>
      : null}
    {license === LicenseTypes.creativeCommons
      ? <div><FormattedMessage {...messages.creativeCommonsIconsLabel} /></div>
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

export default injectIntl(LicenseBlurb);
