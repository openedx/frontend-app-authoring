/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon, Stack, Hyperlink } from '@openedx/paragon';
import {
  Attribution, Copyright, Cc, Nd, Nc, Sa,
} from '@openedx/paragon/icons';

import ApplyWrapper from '../../../generic/ApplyWrapper';
import { LICENSE_TYPE } from '../constants';
import messages from './messages';

const LicenseIcons = ({ licenseType, licenseDetails, licenseURL }) => (
  <ApplyWrapper
    condition={licenseURL}
    wrapper={(children) => (
      <Hyperlink
        destination={licenseURL}
        target="_blank"
        showLaunchIcon={false}
      >
        {children}
      </Hyperlink>
    )}
  >
    <Stack direction="horizontal" gap={1}>
      {[LICENSE_TYPE.allRightsReserved, null].includes(licenseType) && (
        <Icon
          src={Copyright}
          name="testaa"
          className="mr-1 text-gray-700"
          style={{ height: '1.5rem', width: '1.5rem' }}
        />
      )}
      {licenseType === LICENSE_TYPE.creativeCommons && (
        <Icon
          src={Cc}
          className="mr-1 text-gray-700"
          style={{ height: '1.5rem', width: '1.5rem' }}
        />
      )}
      {licenseDetails?.attribution && (
        <Icon
          src={Attribution}
          className="mr-1 text-gray-700"
          style={{ height: '1.5rem', width: '1.5rem' }}
        />
      )}
      {licenseDetails?.nonCommercial && (
        <Icon
          src={Nc}
          className="mr-1 text-gray-700"
          style={{ height: '1.5rem', width: '1.5rem' }}
        />
      )}
      {licenseDetails?.noDerivatives && (
        <Icon
          src={Nd}
          className="mr-1 text-gray-700"
          style={{ height: '1.5rem', width: '1.5rem' }}
        />
      )}
      {licenseDetails?.shareAlike && (
        <Icon
          src={Sa}
          className="mr-1 text-gray-700"
          style={{ height: '1.5rem', width: '1.5rem' }}
        />
      )}
      {[LICENSE_TYPE.allRightsReserved, null].includes(licenseType) && (
        <span className="small text-gray-700">
          <FormattedMessage {...messages.allRightReservedLabel} />
        </span>
      )}
      {licenseType === LICENSE_TYPE.creativeCommons && (
        <span className="small text-gray-700">
          <FormattedMessage {...messages.creativeCommonsReservedLabel} />
        </span>
      )}
    </Stack>
  </ApplyWrapper>
);

LicenseIcons.defaultProps = {
  licenseURL: '',
  licenseType: null,
};

LicenseIcons.propTypes = {
  licenseType: PropTypes.oneOf(Object.values(LICENSE_TYPE)),
  licenseDetails: PropTypes.shape({
    attribution: PropTypes.bool,
    nonCommercial: PropTypes.bool,
    noDerivatives: PropTypes.bool,
    shareAlike: PropTypes.bool,
  }).isRequired,
  licenseURL: PropTypes.string,
};

export default LicenseIcons;
