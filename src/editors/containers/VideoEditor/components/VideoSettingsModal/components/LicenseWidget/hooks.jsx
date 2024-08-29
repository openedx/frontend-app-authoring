import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { actions } from '../../../../../../data/redux';
import { LicenseLevel, LicenseTypes } from '../../../../../../data/constants/licenses';

export const determineLicense = ({
  isLibrary,
  licenseType,
  licenseDetails,
  courseLicenseType,
  courseLicenseDetails,
}) => {
  let level = LicenseLevel.course;
  if (licenseType) {
    if (isLibrary) {
      level = LicenseLevel.library;
    } else {
      level = LicenseLevel.block;
    }
  }

  return {
    license: licenseType || courseLicenseType,
    details: licenseType ? licenseDetails : courseLicenseDetails,
    level,
  };
};

export const determineText = ({ level }) => {
  let levelDescription = '';
  let licenseDescription = '';
  switch (level) {
    case LicenseLevel.course:
      levelDescription = <FormattedMessage {...messages.courseLevelDescription} />;
      licenseDescription = <FormattedMessage {...messages.courseLicenseDescription} />;
      break;
    case LicenseLevel.library:
      levelDescription = <FormattedMessage {...messages.libraryLevelDescription} />;
      licenseDescription = <FormattedMessage {...messages.libraryLicenseDescription} />;
      break;
    default: // default to block
      levelDescription = <FormattedMessage {...messages.defaultLevelDescription} />;
      licenseDescription = <FormattedMessage {...messages.defaultLicenseDescription} />;
      break;
  }

  return {
    levelDescription,
    licenseDescription,
  };
};

export const onSelectLicense = ({
  dispatch,
}) => (license) => {
  switch (license) {
    case LicenseTypes.allRightsReserved:
      dispatch(actions.video.updateField({
        licenseType: LicenseTypes.allRightsReserved,
        licenseDetails: {},
      }));
      break;
    case LicenseTypes.creativeCommons:
      dispatch(actions.video.updateField({
        licenseType: LicenseTypes.creativeCommons,
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
      }));
      break;
    default:
      dispatch(actions.video.updateField({ licenseType: LicenseTypes.select }));
      break;
  }
};

export default {
  determineLicense,
  determineText,
  onSelectLicense,
};
