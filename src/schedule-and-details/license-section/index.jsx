import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import SectionSubHeader from '../../generic/section-sub-header';
import LicenseDisplay from './license-display';
import LicenseSelector from './license-selector';
import LicenseCommonsOptions from './license-commons-options';
import { LICENSE_TYPE } from './constants';
import messages from './messages';
import { useLicenseDetails } from './hooks';

const LicenseSection = ({ license, onChange }) => {
  const intl = useIntl();
  const {
    licenseURL,
    licenseType,
    licenseDetails,
    handleToggleCheckbox,
    handleChangeLicenseType,
  } = useLicenseDetails(license, onChange);

  return (
    <section className="section-container license-section">
      <SectionSubHeader
        title={intl.formatMessage(messages.licenseTitle)}
        description={intl.formatMessage(messages.licenseDescription)}
      />
      <LicenseSelector
        licenseType={licenseType}
        onChangeLicenseType={handleChangeLicenseType}
      />
      {licenseType === LICENSE_TYPE.creativeCommons && (
        <LicenseCommonsOptions
          licenseDetails={licenseDetails}
          onToggleCheckbox={handleToggleCheckbox}
        />
      )}
      <LicenseDisplay
        licenseURL={licenseURL}
        licenseType={licenseType}
        licenseDetails={licenseDetails}
      />
    </section>
  );
};

LicenseSection.defaultProps = {
  license: null,
};

LicenseSection.propTypes = {
  license: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default LicenseSection;
