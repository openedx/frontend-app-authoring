import { useEffect, useState } from 'react';

import { LICENSE_TYPE, LICENSE_COMMONS_OPTIONS, creativeCommonsVersion } from './constants';
import { generateLicenseURL } from './utils';

const useLicenseDetails = (license, onChange) => {
  const [licenseType, setLicenseType] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState({});
  const [licenseURL, setLicenseURL] = useState('');

  const {
    attribution, nonCommercial, noDerivatives, shareAlike,
  } = LICENSE_COMMONS_OPTIONS;

  const defaultLicenseDetails = {
    attribution: true,
    nonCommercial: true,
    noDerivatives: true,
    shareAlike: false,
  };

  const updateLicense = () => {
    if (licenseType === LICENSE_TYPE.allRightsReserved) {
      onChange(LICENSE_TYPE.allRightsReserved, 'license');
    }

    if (licenseType === LICENSE_TYPE.creativeCommons) {
      const orderedDetails = Object.entries(licenseDetails)
        .filter(([, value]) => value)
        .map(([key]) => LICENSE_COMMONS_OPTIONS[key]);

      const updatedString = `${
        LICENSE_TYPE.creativeCommons
      }: ver=${creativeCommonsVersion} ${orderedDetails.join(' ')}`;
      onChange(updatedString, 'license');
    }
  };

  useEffect(() => {
    if (license?.includes(LICENSE_TYPE.creativeCommons)) {
      setLicenseType(LICENSE_TYPE.creativeCommons);
      setLicenseDetails((prevLicenseDetails) => ({
        ...prevLicenseDetails,
        attribution: license.includes(attribution),
        nonCommercial: license.includes(nonCommercial),
        noDerivatives: license.includes(noDerivatives),
        shareAlike: license.includes(shareAlike),
      }));
    } else if (license?.includes(LICENSE_TYPE.allRightsReserved)) {
      setLicenseType(LICENSE_TYPE.allRightsReserved);
      setLicenseDetails({});
    } else {
      setLicenseType(null);
      setLicenseDetails({});
    }
  }, [license]);

  useEffect(() => {
    setLicenseURL(
      licenseType === LICENSE_TYPE.creativeCommons
        ? generateLicenseURL(licenseDetails)
        : '',
    );
    updateLicense();
  }, [licenseType, licenseDetails]);

  const handleToggleCheckbox = (option) => {
    const toggledLicenseDetail = Object.keys(LICENSE_COMMONS_OPTIONS).find(
      (key) => LICENSE_COMMONS_OPTIONS[key] === option,
    );

    setLicenseDetails((prev) => {
      if (option === noDerivatives) {
        return {
          ...prev,
          noDerivatives: !prev.noDerivatives,
          shareAlike: false,
        };
      }

      if (option === shareAlike) {
        return {
          ...prev,
          shareAlike: !prev.shareAlike,
          noDerivatives: false,
        };
      }

      return {
        ...prev,
        [toggledLicenseDetail]: !prev[toggledLicenseDetail],
      };
    });
  };

  const handleChangeLicenseType = (type) => {
    setLicenseType(type);
    setLicenseDetails(
      type === LICENSE_TYPE.creativeCommons ? defaultLicenseDetails : {},
    );
  };

  return {
    licenseURL,
    licenseType,
    licenseDetails,
    handleToggleCheckbox,
    handleChangeLicenseType,
  };
};

export { useLicenseDetails };
