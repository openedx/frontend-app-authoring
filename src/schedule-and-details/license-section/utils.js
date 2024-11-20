import {
  LICENSE_COMMONS_OPTIONS,
  creativeCommonsLicensesURL,
  creativeCommonsVersion,
} from './constants';

const generateLicenseURL = (details) => {
  const detailsString = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key]) => LICENSE_COMMONS_OPTIONS[key].toLowerCase())
    .join('-');

  return `${creativeCommonsLicensesURL}/${detailsString}/${creativeCommonsVersion}`;
};

export { generateLicenseURL };
