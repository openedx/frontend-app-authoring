import { LICENSE_COMMONS_OPTIONS } from './constants';

const generateLicenseURL = (details) => {
  const url = 'https://creativecommons.org/licenses/';
  const detailsString = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key]) => LICENSE_COMMONS_OPTIONS[key].toLowerCase())
    .join('-');

  return `${url}${detailsString}/4.0/`;
};

// eslint-disable-next-line import/prefer-default-export
export { generateLicenseURL };
